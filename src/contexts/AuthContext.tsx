import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  ConfirmationResult 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db, setupRecaptcha, sendPhoneOTP } from '@/lib/firebase';

// User profile interface for CampusCrew
export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  college: string;
  year: string;
  branch: string;
  rollNumber: string;
  phone: string;
  profilePicture?: string;
  authMethod: 'google' | 'phone';
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Google Auth
  signInWithGoogle: () => Promise<void>;
  
  // Phone Auth
  sendOTP: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  
  // Profile management
  createUserProfile: (userData: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (userData: Partial<UserProfile>) => Promise<void>;
  
  // Sign out
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // New user - create basic profile with Google data
        const newProfile: Partial<UserProfile> = {
          uid: user.uid,
          email: user.email || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          profilePicture: user.photoURL || '',
          authMethod: 'google',
          college: '', // Will be filled in profile page
          year: '',
          branch: '',
          rollNumber: '',
          phone: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await createUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Phone Auth - Send OTP
  const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const formattedPhone = `+91${phoneNumber}`;
      const confirmationResult = await sendPhoneOTP(formattedPhone, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  // Phone Auth - Verify OTP
  const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string) => {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // New user - will need to complete profile
        const newProfile: Partial<UserProfile> = {
          uid: user.uid,
          phone: user.phoneNumber || '',
          authMethod: 'phone',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await createUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  // Create user profile
  const createUserProfile = async (userData: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...userData,
        uid: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Fetch the created profile
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userData: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Load user profile when user changes
  useEffect(() => {
    const loadUserProfile = async (user: User) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    sendOTP,
    verifyOTP,
    createUserProfile,
    updateUserProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

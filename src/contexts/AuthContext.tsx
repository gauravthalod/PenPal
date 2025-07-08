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
      console.log('🔄 Starting Google sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('✅ Google sign in successful for:', user.uid);

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        console.log('🆕 New Google user, creating profile...');
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

        // Use direct Firebase operations to avoid timing issues
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, newProfile);
        console.log('✅ Google user profile created');

        // Set the profile in state
        setUserProfile(newProfile as UserProfile);
      } else {
        console.log('✅ Existing Google user profile found');
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('❌ Error signing in with Google:', error);
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
      console.log('🔄 Verifying OTP...');
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      console.log('✅ OTP verification successful for:', user.uid);

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        console.log('🆕 New phone user, creating basic profile...');
        // New user - will need to complete profile
        const newProfile: Partial<UserProfile> = {
          uid: user.uid,
          email: '', // Will be filled in profile page
          firstName: '', // Will be filled in profile page
          lastName: '', // Will be filled in profile page
          phone: user.phoneNumber || '',
          authMethod: 'phone',
          college: '', // Will be filled in profile page
          year: '',
          branch: '',
          rollNumber: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Use direct Firebase operations to avoid timing issues
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, newProfile);
        console.log('✅ Phone user profile created');

        // Set the profile in state
        setUserProfile(newProfile as UserProfile);
      } else {
        console.log('✅ Existing phone user profile found');
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      throw error;
    }
  };

  // Create user profile
  const createUserProfile = async (userData: Partial<UserProfile>) => {
    // Get the current user from auth directly to avoid timing issues
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user found when creating profile');
      throw new Error('No authenticated user found');
    }

    try {
      console.log('🔄 Creating user profile for:', user.uid, userData);
      const userRef = doc(db, 'users', user.uid);
      const profileData = {
        ...userData,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(userRef, profileData);
      console.log('✅ User profile created successfully');

      // Fetch the created profile to confirm
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const createdProfile = userDoc.data() as UserProfile;
        console.log('✅ Profile verified in database:', createdProfile);
        setUserProfile(createdProfile);
      } else {
        console.error('❌ Profile was not saved to database');
        throw new Error('Profile was not saved to database');
      }
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userData: Partial<UserProfile>) => {
    // Get the current user from auth directly to avoid timing issues
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No authenticated user found when updating profile');
      throw new Error('No authenticated user found');
    }

    try {
      console.log('🔄 Updating user profile for:', user.uid, userData);
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...userData,
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);
      console.log('✅ User profile updated successfully');

      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updateData } : null);

      // Verify the update by fetching from database
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const updatedProfile = userDoc.data() as UserProfile;
        console.log('✅ Profile update verified in database:', updatedProfile);
        setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
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
        console.log("🔍 Loading user profile for:", user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          console.log("✅ User profile loaded:", profileData);
          setUserProfile(profileData);
        } else {
          console.warn("⚠️ No user profile found for:", user.uid);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('❌ Error loading user profile:', error);
        setUserProfile(null);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔄 Auth state changed:", user ? `User: ${user.uid}` : "No user");
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

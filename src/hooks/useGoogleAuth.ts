import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import googleAuthService, { GoogleUser, GoogleAuthResponse } from '@/services/googleAuth';

interface UseGoogleAuthReturn {
  isLoading: boolean;
  isInitialized: boolean;
  user: GoogleUser | null;
  signInWithGoogle: () => void;
  signOut: () => void;
  renderGoogleButton: (elementId: string, options?: any) => void;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize Google Auth Service
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await googleAuthService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to initialize Google authentication. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeGoogleAuth();
  }, [toast]);

  // Handle Google OAuth response
  const handleGoogleResponse = useCallback(async (response: GoogleAuthResponse) => {
    setIsLoading(true);
    
    try {
      // Decode the JWT token to get user information
      const userData = googleAuthService.decodeJWT(response.credential);
      
      if (!userData) {
        throw new Error('Failed to decode user information');
      }

      // Validate CMR email domain
      if (!googleAuthService.validateCMREmail(userData.email)) {
        toast({
          title: "Invalid Email Domain",
          description: "Please use your CMR Group institution email address (cmrec.ac.in, cmrit.ac.in, cmrtc.ac.in, cmrcet.ac.in, or cmr.edu.in).",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get college information
      const college = googleAuthService.getCollegeFromEmail(userData.email);

      // Create user profile
      const userProfile = {
        ...userData,
        college,
      };

      // Store user data in localStorage (simulating backend)
      localStorage.setItem('campuscrew_user', JSON.stringify(userProfile));
      localStorage.setItem('campuscrew_auth_token', response.credential);
      localStorage.setItem('campuscrew_auth_method', 'google');

      setUser(userData);

      toast({
        title: "Welcome to CampusCrew!",
        description: `Successfully signed in with ${userData.email}`,
      });

      // Navigate to main page
      navigate('/');

    } catch (error) {
      console.error('Google authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, navigate]);

  // Sign in with Google
  const signInWithGoogle = useCallback(() => {
    if (!isInitialized) {
      toast({
        title: "Not Ready",
        description: "Google authentication is still loading. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }

    try {
      googleAuthService.initializeOneTap(handleGoogleResponse);
      googleAuthService.showOneTap();
    } catch (error) {
      console.error('Failed to initiate Google sign-in:', error);
      toast({
        title: "Sign-in Error",
        description: "Failed to start Google sign-in. Please try again.",
        variant: "destructive",
      });
    }
  }, [isInitialized, handleGoogleResponse, toast]);

  // Render Google Sign-in button
  const renderGoogleButton = useCallback((elementId: string, options: any = {}) => {
    if (!isInitialized) {
      console.warn('Google Auth not initialized yet');
      return;
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 280,
    };

    const buttonOptions = { ...defaultOptions, ...options };

    googleAuthService.renderSignInButton(elementId, handleGoogleResponse, buttonOptions);
  }, [isInitialized, handleGoogleResponse]);

  // Sign out
  const signOut = useCallback(() => {
    try {
      googleAuthService.signOut();
      localStorage.removeItem('campuscrew_user');
      localStorage.removeItem('campuscrew_auth_token');
      localStorage.removeItem('campuscrew_auth_method');
      setUser(null);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out completely. Please clear your browser data.",
        variant: "destructive",
      });
    }
  }, [toast, navigate]);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('campuscrew_user');
    const authMethod = localStorage.getItem('campuscrew_auth_method');
    
    if (storedUser && authMethod === 'google') {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('campuscrew_user');
        localStorage.removeItem('campuscrew_auth_token');
        localStorage.removeItem('campuscrew_auth_method');
      }
    }
  }, []);

  return {
    isLoading,
    isInitialized,
    user,
    signInWithGoogle,
    signOut,
    renderGoogleButton,
  };
};

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import otpService, { SendOTPResponse, VerifyOTPResponse } from '@/services/otpService';

interface UseOTPAuthReturn {
  // Phone number step
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  isValidPhone: boolean;
  phoneError: string;
  
  // OTP step
  otp: string;
  setOtp: (otp: string) => void;
  sessionId: string | null;
  timeRemaining: number;
  canResend: boolean;
  
  // Loading states
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;
  
  // Actions
  sendOTP: () => Promise<void>;
  verifyOTP: () => Promise<void>;
  resendOTP: () => Promise<void>;
  resetFlow: () => void;
  
  // Flow state
  step: 'phone' | 'otp' | 'complete';
  user: any | null;
}

export const useOTPAuth = (): UseOTPAuthReturn => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp' | 'complete'>('phone');
  const [user, setUser] = useState<any | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Validate phone number in real-time
  useEffect(() => {
    if (phoneNumber.length === 0) {
      setIsValidPhone(false);
      setPhoneError('');
      return;
    }

    const validation = otpService.validatePhoneNumber(phoneNumber);
    setIsValidPhone(validation.isValid);
    setPhoneError(validation.error || '');
  }, [phoneNumber]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && sessionId) {
      setCanResend(true);
    }
  }, [timeRemaining, sessionId]);

  // Send OTP to phone number
  const sendOTP = useCallback(async () => {
    if (!isValidPhone) {
      toast({
        title: "Invalid Phone Number",
        description: phoneError || "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOTP(true);
    
    try {
      const response: SendOTPResponse = await otpService.sendOTP(phoneNumber);
      
      if (response.success) {
        setSessionId(response.sessionId || null);
        setTimeRemaining(response.expiresIn || 300); // 5 minutes default
        setCanResend(false);
        setStep('otp');
        setOtp(''); // Clear any previous OTP
        
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });
      } else {
        toast({
          title: "Failed to Send OTP",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  }, [phoneNumber, isValidPhone, phoneError, toast]);

  // Verify OTP
  const verifyOTP = useCallback(async () => {
    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "Please request a new OTP",
        variant: "destructive",
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOTP(true);

    try {
      const response: VerifyOTPResponse = await otpService.verifyOTP(sessionId, otp);
      
      if (response.success && response.user) {
        // Store user data
        const userData = {
          phoneNumber: response.user.phoneNumber,
          formattedPhone: response.user.formattedPhone,
          countryCode: response.user.countryCode,
          isNewUser: response.user.isNewUser,
          loginMethod: 'phone',
          loginTime: new Date().toISOString(),
        };

        // Save to localStorage (simulate backend)
        localStorage.setItem('campuscrew_user', JSON.stringify(userData));
        localStorage.setItem('campuscrew_auth_token', `phone_${sessionId}`);
        localStorage.setItem('campuscrew_auth_method', 'phone');

        setUser(userData);
        setStep('complete');

        toast({
          title: "Welcome to CampusCrew!",
          description: response.user.isNewUser 
            ? "Account created successfully" 
            : "Logged in successfully",
        });

        // Navigate based on user type
        if (response.user.isNewUser) {
          // New user - might want to go to profile setup
          navigate('/');
        } else {
          // Existing user - go to main page
          navigate('/');
        }

      } else {
        toast({
          title: "Verification Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOTP(false);
    }
  }, [sessionId, otp, toast, navigate]);

  // Resend OTP
  const resendOTP = useCallback(async () => {
    if (!sessionId) {
      // If no session, treat as new OTP request
      await sendOTP();
      return;
    }

    setIsSendingOTP(true);

    try {
      const response: SendOTPResponse = await otpService.resendOTP(sessionId);
      
      if (response.success) {
        setSessionId(response.sessionId || sessionId);
        setTimeRemaining(response.expiresIn || 300);
        setCanResend(false);
        setOtp(''); // Clear current OTP
        
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your phone",
        });
      } else {
        toast({
          title: "Failed to Resend OTP",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  }, [sessionId, sendOTP, toast]);

  // Reset the entire flow
  const resetFlow = useCallback(() => {
    setPhoneNumber('');
    setOtp('');
    setSessionId(null);
    setTimeRemaining(0);
    setCanResend(false);
    setStep('phone');
    setUser(null);
    setPhoneError('');
    setIsValidPhone(false);
  }, []);

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('campuscrew_user');
    const authMethod = localStorage.getItem('campuscrew_auth_method');
    
    if (storedUser && authMethod === 'phone') {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setStep('complete');
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('campuscrew_user');
        localStorage.removeItem('campuscrew_auth_token');
        localStorage.removeItem('campuscrew_auth_method');
      }
    }
  }, []);

  return {
    // Phone number step
    phoneNumber,
    setPhoneNumber,
    isValidPhone,
    phoneError,
    
    // OTP step
    otp,
    setOtp,
    sessionId,
    timeRemaining,
    canResend,
    
    // Loading states
    isSendingOTP,
    isVerifyingOTP,
    
    // Actions
    sendOTP,
    verifyOTP,
    resendOTP,
    resetFlow,
    
    // Flow state
    step,
    user,
  };
};

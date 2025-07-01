// OTP Service for CampusCrew Phone Authentication

import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

interface OTPSession {
  phoneNumber: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  isVerified: boolean;
  createdAt: number;
}

interface SendOTPResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  expiresIn?: number;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  user?: {
    phoneNumber: string;
    formattedPhone: string;
    countryCode: string;
    isNewUser: boolean;
  };
}

class OTPService {
  private sessions: Map<string, OTPSession> = new Map();
  private readonly OTP_LENGTH = parseInt(process.env.REACT_APP_OTP_LENGTH || '6');
  private readonly OTP_EXPIRY_MINUTES = parseInt(process.env.REACT_APP_OTP_EXPIRY_MINUTES || '5');
  private readonly MAX_ATTEMPTS = 3;
  private readonly SMS_PROVIDER = process.env.REACT_APP_SMS_PROVIDER || 'mock';

  // Generate a random OTP
  private generateOTP(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Validate and format phone number
  validatePhoneNumber(phoneNumber: string, defaultCountry: CountryCode = 'IN'): {
    isValid: boolean;
    formatted?: string;
    international?: string;
    countryCode?: string;
    error?: string;
  } {
    try {
      // Remove any non-digit characters except +
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      
      if (!cleanPhone) {
        return { isValid: false, error: 'Phone number is required' };
      }

      // Check if it's a valid phone number
      if (!isValidPhoneNumber(cleanPhone, defaultCountry)) {
        return { isValid: false, error: 'Invalid phone number format' };
      }

      const parsed = parsePhoneNumber(cleanPhone, defaultCountry);
      
      if (!parsed) {
        return { isValid: false, error: 'Unable to parse phone number' };
      }

      return {
        isValid: true,
        formatted: parsed.formatNational(),
        international: parsed.formatInternational(),
        countryCode: parsed.country || defaultCountry,
      };
    } catch (error) {
      return { isValid: false, error: 'Invalid phone number' };
    }
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
    try {
      // Validate phone number
      const validation = this.validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error || 'Invalid phone number',
        };
      }

      const formattedPhone = validation.international!;
      
      // Check for existing session
      const existingSessionId = this.findSessionByPhone(formattedPhone);
      if (existingSessionId) {
        const session = this.sessions.get(existingSessionId);
        if (session && session.expiresAt > Date.now()) {
          // Session still valid, don't send new OTP immediately
          const remainingTime = Math.ceil((session.expiresAt - Date.now()) / 1000);
          if (remainingTime > 240) { // More than 4 minutes remaining
            return {
              success: false,
              message: `Please wait ${Math.ceil(remainingTime / 60)} minutes before requesting a new OTP`,
            };
          }
        }
      }

      // Generate new OTP and session
      const otp = this.generateOTP();
      const sessionId = this.generateSessionId();
      const expiresAt = Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store session
      this.sessions.set(sessionId, {
        phoneNumber: formattedPhone,
        otp,
        expiresAt,
        attempts: 0,
        isVerified: false,
        createdAt: Date.now(),
      });

      // Simulate sending SMS (in real app, integrate with SMS provider)
      await this.sendSMS(formattedPhone, otp);

      // Clean up old sessions
      this.cleanupExpiredSessions();

      return {
        success: true,
        message: 'OTP sent successfully',
        sessionId,
        expiresIn: this.OTP_EXPIRY_MINUTES * 60,
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  // Verify OTP
  async verifyOTP(sessionId: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return {
          success: false,
          message: 'Invalid or expired session. Please request a new OTP.',
        };
      }

      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        this.sessions.delete(sessionId);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
        };
      }

      // Check if already verified
      if (session.isVerified) {
        return {
          success: false,
          message: 'OTP has already been used. Please request a new one.',
        };
      }

      // Increment attempts
      session.attempts++;

      // Check max attempts
      if (session.attempts > this.MAX_ATTEMPTS) {
        this.sessions.delete(sessionId);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
        };
      }

      // Verify OTP
      if (session.otp !== otp.trim()) {
        return {
          success: false,
          message: `Invalid OTP. ${this.MAX_ATTEMPTS - session.attempts} attempts remaining.`,
        };
      }

      // Mark as verified
      session.isVerified = true;

      // Check if user exists (simulate database check)
      const isNewUser = !this.userExists(session.phoneNumber);

      // Parse phone number for user data
      const phoneValidation = this.validatePhoneNumber(session.phoneNumber);

      return {
        success: true,
        message: 'OTP verified successfully',
        user: {
          phoneNumber: session.phoneNumber,
          formattedPhone: phoneValidation.formatted || session.phoneNumber,
          countryCode: phoneValidation.countryCode || 'IN',
          isNewUser,
        },
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  }

  // Simulate SMS sending (replace with real SMS provider)
  private async sendSMS(phoneNumber: string, otp: string): Promise<void> {
    if (this.SMS_PROVIDER === 'mock') {
      // Mock SMS - log to console for development
      console.log(`📱 SMS to ${phoneNumber}: Your CampusCrew OTP is ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`);
      
      // For demo purposes, show OTP in browser console
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 Demo OTP for ${phoneNumber}: ${otp}`);
      }
      
      return Promise.resolve();
    }
    
    // In production, integrate with SMS providers like:
    // - Twilio
    // - AWS SNS
    // - Firebase Cloud Messaging
    // - MSG91
    // - TextLocal
    
    throw new Error('SMS provider not configured');
  }

  // Check if user exists (simulate database check)
  private userExists(phoneNumber: string): boolean {
    // In real app, check database
    const existingUsers = JSON.parse(localStorage.getItem('campuscrew_users') || '[]');
    return existingUsers.some((user: any) => user.phoneNumber === phoneNumber);
  }

  // Find session by phone number
  private findSessionByPhone(phoneNumber: string): string | null {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.phoneNumber === phoneNumber) {
        return sessionId;
      }
    }
    return null;
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Get session info (for debugging)
  getSessionInfo(sessionId: string): Partial<OTPSession> | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      phoneNumber: session.phoneNumber,
      expiresAt: session.expiresAt,
      attempts: session.attempts,
      isVerified: session.isVerified,
      createdAt: session.createdAt,
    };
  }

  // Resend OTP (with rate limiting)
  async resendOTP(sessionId: string): Promise<SendOTPResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Session not found. Please start over.',
      };
    }

    // Check if enough time has passed since last OTP
    const timeSinceCreated = Date.now() - session.createdAt;
    const minResendInterval = 60 * 1000; // 1 minute

    if (timeSinceCreated < minResendInterval) {
      const waitTime = Math.ceil((minResendInterval - timeSinceCreated) / 1000);
      return {
        success: false,
        message: `Please wait ${waitTime} seconds before requesting a new OTP`,
      };
    }

    // Delete old session and create new one
    this.sessions.delete(sessionId);
    return this.sendOTP(session.phoneNumber);
  }
}

// Export singleton instance
export const otpService = new OTPService();
export default otpService;
export type { SendOTPResponse, VerifyOTPResponse };

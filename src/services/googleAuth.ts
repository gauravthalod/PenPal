// Google OAuth Authentication Service for CampusCrew

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  verified_email: boolean;
}

interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  }

  // Initialize Google Identity Services
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google Identity Services script
      if (!document.getElementById('google-identity-script')) {
        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.isInitialized = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load Google Identity Services'));
        };
        document.head.appendChild(script);
      } else {
        this.isInitialized = true;
        resolve();
      }
    });
  }

  // Initialize Google One Tap
  initializeOneTap(callback: (response: GoogleAuthResponse) => void): void {
    if (!window.google || !this.clientId) {
      console.error('Google Identity Services not loaded or client ID not configured');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: callback,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  // Show Google One Tap prompt
  showOneTap(): void {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('One Tap not displayed or skipped');
      }
    });
  }

  // Render Google Sign-In button
  renderSignInButton(
    elementId: string,
    callback: (response: GoogleAuthResponse) => void,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
    } = {}
  ): void {
    if (!window.google || !this.clientId) {
      console.error('Google Identity Services not loaded or client ID not configured');
      return;
    }

    const defaultOptions = {
      theme: 'outline' as const,
      size: 'large' as const,
      text: 'signin_with' as const,
      shape: 'rectangular' as const,
      width: 280,
    };

    const buttonOptions = { ...defaultOptions, ...options };

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: callback,
    });

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      buttonOptions
    );
  }

  // Decode JWT token to get user information
  decodeJWT(token: string): GoogleUser | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as GoogleUser;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  // Validate if email belongs to CMR Group institutions
  validateCMREmail(email: string): boolean {
    const validDomains = [
      'cmrec.ac.in',
      'cmrit.ac.in',
      'cmrtc.ac.in',
      'cmrcet.ac.in',
      'cmr.edu.in'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return validDomains.includes(domain);
  }

  // Get college name from email domain
  getCollegeFromEmail(email: string): string {
    const domain = email.split('@')[1]?.toLowerCase();
    
    switch (domain) {
      case 'cmrec.ac.in':
        return 'CMR Engineering College';
      case 'cmrit.ac.in':
        return 'CMR Institute of Technology';
      case 'cmrtc.ac.in':
        return 'CMR Technical Campus';
      case 'cmrcet.ac.in':
        return 'CMR College of Engineering & Technology';
      case 'cmr.edu.in':
        return 'CMR Group of Institutions';
      default:
        return 'Unknown College';
    }
  }

  // Sign out from Google
  signOut(): void {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // Check if Google Identity Services is available
  isAvailable(): boolean {
    return !!(window.google && window.google.accounts && window.google.accounts.id);
  }
}

// Global type declarations for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
export default googleAuthService;
export type { GoogleUser, GoogleAuthResponse };

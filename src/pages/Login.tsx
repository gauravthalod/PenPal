import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, GraduationCap, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmationResult } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithGoogle, sendOTP, verifyOTP } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [formData, setFormData] = useState({
    phone: "",
    otp: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Format as +91 XXXXX XXXXX
    if (cleanPhone.length <= 10) {
      return cleanPhone.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return cleanPhone;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!formData.phone) {
      setError("Please enter your phone number");
      setIsLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number");
      setIsLoading(false);
      return;
    }

    try {
      // Use Firebase phone authentication
      const confirmation = await sendOTP(formData.phone);
      setConfirmationResult(confirmation);
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: `Verification code sent to +91 ${formatPhoneNumber(formData.phone)}`,
      });
    } catch (err: any) {
      console.error("OTP send error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!formData.otp) {
      setError("Please enter the OTP");
      setIsLoading(false);
      return;
    }

    if (formData.otp.length !== 6) {
      setError("OTP must be 6 digits");
      setIsLoading(false);
      return;
    }

    if (!confirmationResult) {
      setError("Please request a new OTP");
      setIsLoading(false);
      return;
    }

    try {
      // Use Firebase to verify OTP
      await verifyOTP(confirmationResult, formData.otp);
      toast({
        title: "Login Successful",
        description: "Welcome back to CampusCrew!",
      });
      navigate("/");
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      await signInWithGoogle();
      toast({
        title: "Login Successful",
        description: "Welcome back to CampusCrew!",
      });
      navigate("/profile"); // Redirect to profile page after Google login
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setIsLoading(true);

    try {
      const confirmation = await sendOTP(formData.phone);
      setConfirmationResult(confirmation);
      toast({
        title: "OTP Resent",
        description: `New verification code sent to +91 ${formatPhoneNumber(formData.phone)}`,
      });
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtpSent(false);
    setFormData(prev => ({ ...prev, otp: "" }));
    setError("");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">CampusCrew</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            {step === "phone" ? "Sign in with your phone number" : "Enter verification code"}
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {step === "phone" ? "Login" : "Verify OTP"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange("phone", value);
                      }}
                      className="pl-16"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your 10-digit mobile number
                  </p>
                </div>

                {/* Demo Credentials */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-1">Demo Login:</p>
                  <p className="text-xs text-blue-600">Phone: 9876543210</p>
                  <p className="text-xs text-blue-600">OTP: 123456</p>
                </div>

                {/* Send OTP Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isLoading ? "Signing in..." : "Sign in with Google"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Phone Number Display */}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    OTP sent to +91 {formatPhoneNumber(formData.phone)}
                  </p>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP *</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={formData.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        handleInputChange("otp", value);
                      }}
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>

                {/* Verify OTP Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>

                {/* Resend OTP */}
                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Change phone number
                  </button>
                </div>
              </form>
            )}

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          <button
            onClick={() => navigate("/admin/login")}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Admin Access
          </button>
        </div>

        {/* reCAPTCHA container for phone auth */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default Login;

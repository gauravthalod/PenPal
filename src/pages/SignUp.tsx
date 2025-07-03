import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, User, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmationResult } from "firebase/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithGoogle, sendOTP, verifyOTP, createUserProfile } = useAuth();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    college: "",
    year: "",
    branch: "",
    phone: "",
    rollNumber: "",
    otp: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // CMR Group colleges
  const colleges = [
    { value: "cmrec", label: "CMREC - CMR Engineering College", domain: "cmrec.ac.in" },
    { value: "cmrit", label: "CMRIT - CMR Institute of Technology", domain: "cmrit.ac.in" },
    { value: "cmrtc", label: "CMRTC - CMR Technical Campus", domain: "cmrtc.ac.in" },
    { value: "cmrcet", label: "CMRCET - CMR College of Engineering & Technology", domain: "cmrcet.ac.in" }
  ];

  const academicYears = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "pg1", label: "PG 1st Year" },
    { value: "pg2", label: "PG 2nd Year" }
  ];

  const branches = [
    "Computer Science Engineering",
    "Information Technology", 
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Aerospace Engineering",
    "Data Science",
    "Artificial Intelligence & Machine Learning"
  ];

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

  const validateForm = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your full name");
      return false;
    }

    if (!formData.phone) {
      setError("Please enter your phone number");
      return false;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    if (!formData.college) {
      setError("Please select your college");
      return false;
    }

    if (!formData.year || !formData.branch) {
      setError("Please select your academic year and branch");
      return false;
    }

    if (!formData.rollNumber) {
      setError("Please enter your roll number");
      return false;
    }

    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!validateForm()) {
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

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
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
      // Verify OTP with Firebase
      await verifyOTP(confirmationResult, formData.otp);

      // Create user profile with form data
      await createUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        college: formData.college,
        year: formData.year,
        branch: formData.branch,
        phone: formData.phone,
        rollNumber: formData.rollNumber,
        authMethod: 'phone'
      });

      toast({
        title: "Registration Successful!",
        description: "Welcome to CampusCrew! You can now access your dashboard.",
      });

      // Navigate to dashboard
      navigate("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsLoading(true);

    try {
      await signInWithGoogle();
      toast({
        title: "Sign Up Successful!",
        description: "Welcome to CampusCrew! Please complete your profile.",
      });
      navigate("/profile"); // Redirect to profile completion
    } catch (err: any) {
      console.error("Google sign up error:", err);
      setError(err.message || "Failed to sign up with Google. Please try again.");
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

  const handleBackToDetails = () => {
    setStep("details");
    setOtpSent(false);
    setFormData(prev => ({ ...prev, otp: "" }));
    setError("");
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-600">CampusCrew</h1>
          </div>
          <p className="text-gray-600">
            {step === "details" ? "Join the CMR Group community" : "Verify your phone number"}
          </p>
        </div>

        {/* Sign Up Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {step === "details" ? "Create Your Account" : "Verify Phone Number"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === "details" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* College Selection */}
              <div className="space-y-2">
                <Label htmlFor="college">College *</Label>
                <Select value={formData.college} onValueChange={(value) => handleInputChange("college", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.value} value={college.value}>
                        {college.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {/* Academic Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    placeholder="e.g., 21R01A0501"
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange("rollNumber", e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch">Branch/Department *</Label>
                <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Send OTP Button */}
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP & Continue"}
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

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
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
                {isLoading ? "Signing up..." : "Sign up with Google"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
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

              {/* Demo OTP */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-1">Demo OTP:</p>
                <p className="text-xs text-blue-600">Use: 123456</p>
              </div>

              {/* Verify and Register Button */}
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Verify & Create Account"}
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
                  onClick={handleBackToDetails}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Change details
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Sign in
              </button>
            </p>
          </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>

        {/* reCAPTCHA container for phone auth */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default SignUp;

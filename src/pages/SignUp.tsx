import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, MessageSquare, GraduationCap, User, ArrowLeft, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOTPAuth } from "@/hooks/useOTPAuth";
import OtpInput from 'react-otp-input';

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    phoneNumber,
    setPhoneNumber,
    isValidPhone,
    phoneError,
    otp,
    setOtp,
    timeRemaining,
    canResend,
    isSendingOTP,
    isVerifyingOTP,
    sendOTP,
    verifyOTP,
    resendOTP,
    resetFlow,
    step,
  } = useOTPAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    college: "",
    year: "",
    branch: "",
  });

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const colleges = [
    "CMR Engineering College",
    "CMR Institute of Technology", 
    "CMR Technical Campus",
    "CMR College of Engineering & Technology",
    "CMR Group of Institutions"
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
  
  const branches = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics and Communication",
    "Electrical and Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Aerospace Engineering",
    "Other"
  ];

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOTP();
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For signup, we need to show profile form after OTP verification
    const result = await verifyOTP();
    if (result) {
      setShowProfileForm(true);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate profile data
    if (!profileData.firstName || !profileData.lastName || !profileData.college || !profileData.year || !profileData.branch) {
      toast({
        title: "Incomplete Profile",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingProfile(true);

    try {
      // Simulate profile creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create complete user profile
      const userData = {
        phoneNumber,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        fullName: `${profileData.firstName} ${profileData.lastName}`,
        college: profileData.college,
        year: profileData.year,
        branch: profileData.branch,
        loginMethod: 'phone',
        createdAt: new Date().toISOString(),
        isNewUser: true,
      };

      // Save to localStorage (simulate backend)
      localStorage.setItem('campuscrew_user', JSON.stringify(userData));
      localStorage.setItem('campuscrew_auth_token', `phone_signup_${Date.now()}`);
      localStorage.setItem('campuscrew_auth_method', 'phone');

      toast({
        title: "Account Created Successfully!",
        description: "Welcome to CampusCrew! Your account has been created.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Profile Creation Failed",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderPhoneStep = () => (
    <form onSubmit={handlePhoneSubmit} className="space-y-4">
      {/* Phone Number Input */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        {phoneError && (
          <p className="text-sm text-red-600">{phoneError}</p>
        )}
      </div>

      {/* Demo Credentials */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-700 font-medium mb-1">Demo Credentials:</p>
        <p className="text-xs text-blue-600">Phone: +919876543210</p>
        <p className="text-xs text-blue-600">OTP: 123456</p>
      </div>

      {/* Send OTP Button */}
      <Button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600"
        disabled={!isValidPhone || isSendingOTP}
      >
        {isSendingOTP ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );

  const renderOTPStep = () => (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={resetFlow}
        className="mb-4 p-0 h-auto text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Change Phone Number
      </Button>

      {/* Phone Number Display */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Enter the 6-digit code sent to
        </p>
        <p className="font-medium text-gray-900">{phoneNumber}</p>
      </div>

      <form onSubmit={handleOTPSubmit} className="space-y-4">
        {/* OTP Input */}
        <div className="space-y-2">
          <Label className="block text-center">Verification Code</Label>
          <div className="flex justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              separator={<span className="mx-1"></span>}
              inputStyle={{
                width: '40px',
                height: '40px',
                margin: '0 4px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                textAlign: 'center',
                outline: 'none',
              }}
              focusStyle={{
                border: '2px solid #3b82f6',
              }}
            />
          </div>
        </div>

        {/* Timer and Resend */}
        <div className="text-center">
          {timeRemaining > 0 ? (
            <p className="text-sm text-gray-600">
              Resend OTP in {formatTimeRemaining(timeRemaining)}
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={resendOTP}
              disabled={isSendingOTP}
              className="text-blue-600 hover:text-blue-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isSendingOTP ? "Sending..." : "Resend OTP"}
            </Button>
          )}
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={otp.length !== 6 || isVerifyingOTP}
        >
          {isVerifyingOTP ? "Verifying..." : "Verify Phone"}
        </Button>
      </form>
    </div>
  );

  const renderProfileStep = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Complete Your Profile</h3>
        <p className="text-sm text-gray-600">Tell us a bit about yourself</p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="John"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      {/* College */}
      <div className="space-y-2">
        <Label htmlFor="college">College</Label>
        <Select value={profileData.college} onValueChange={(value) => setProfileData(prev => ({ ...prev, college: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select your college" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((college) => (
              <SelectItem key={college} value={college}>
                {college}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year and Branch */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select value={profileData.year} onValueChange={(value) => setProfileData(prev => ({ ...prev, year: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Select value={profileData.branch} onValueChange={(value) => setProfileData(prev => ({ ...prev, branch: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
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
      </div>

      {/* Create Account Button */}
      <Button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600"
        disabled={isCreatingProfile}
      >
        {isCreatingProfile ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );

  const getCurrentStep = () => {
    if (showProfileForm) return 'profile';
    return step;
  };

  const getStepTitle = () => {
    switch (getCurrentStep()) {
      case 'phone': return 'Sign Up';
      case 'otp': return 'Verify Phone';
      case 'profile': return 'Complete Profile';
      default: return 'Sign Up';
    }
  };

  const getStepIcon = () => {
    switch (getCurrentStep()) {
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'otp': return <MessageSquare className="w-5 h-5" />;
      case 'profile': return <User className="w-5 h-5" />;
      default: return <Phone className="w-5 h-5" />;
    }
  };

  const renderCurrentStep = () => {
    switch (getCurrentStep()) {
      case 'phone': return renderPhoneStep();
      case 'otp': return renderOTPStep();
      case 'profile': return renderProfileStep();
      default: return renderPhoneStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-8">
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
            {getCurrentStep() === 'phone' && 'Create your student account'}
            {getCurrentStep() === 'otp' && 'Verify your phone number'}
            {getCurrentStep() === 'profile' && 'Complete your profile'}
          </p>
        </div>

        {/* SignUp Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              {getStepIcon()}
              {getStepTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}

            {/* Login Link - only show on phone step */}
            {getCurrentStep() === 'phone' && (
              <div className="text-center pt-4 border-t mt-6">
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
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

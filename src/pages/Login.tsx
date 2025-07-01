import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, MessageSquare, GraduationCap, ArrowLeft, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOTPAuth } from "@/hooks/useOTPAuth";
import OtpInput from 'react-otp-input';

const Login = () => {
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOTP();
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOTP();
  };

  const handleSignUp = () => {
    navigate("/signup");
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
          {isVerifyingOTP ? "Verifying..." : "Verify & Login"}
        </Button>
      </form>
    </div>
  );

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
            {step === 'phone' ? 'Sign in with your phone number' : 'Verify your phone number'}
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              {step === 'phone' ? (
                <>
                  <Phone className="w-5 h-5" />
                  Login
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  Verify OTP
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? renderPhoneStep() : renderOTPStep()}

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t mt-6">
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
          <p>Secure authentication via SMS verification</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

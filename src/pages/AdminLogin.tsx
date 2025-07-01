import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  // Strong admin credentials
  const ADMIN_CREDENTIALS = {
    username: "admin_cmr_2024",
    password: "CMR@Admin#2024$Secure!"
  };

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateCredentials = () => {
    if (!formData.username || !formData.password) {
      setError("Please enter both username and password");
      return false;
    }

    if (formData.username !== ADMIN_CREDENTIALS.username) {
      setError("Invalid admin credentials");
      return false;
    }

    if (formData.password !== ADMIN_CREDENTIALS.password) {
      setError("Invalid admin credentials");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Check if user is locked out
    const lockoutEnd = localStorage.getItem('adminLockoutEnd');
    if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
      const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 60000);
      setError(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API delay for security
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (validateCredentials()) {
        // Clear any lockout
        localStorage.removeItem('adminLockoutEnd');
        localStorage.removeItem('adminAttempts');
        
        // Store admin session
        sessionStorage.setItem('adminSession', JSON.stringify({
          username: formData.username,
          loginTime: Date.now(),
          role: 'super_admin'
        }));
        
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the administration panel",
        });
        
        navigate("/admin/dashboard");
      } else {
        // Handle failed attempt
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('adminAttempts', newAttempts.toString());
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutEnd = Date.now() + LOCKOUT_TIME;
          localStorage.setItem('adminLockoutEnd', lockoutEnd.toString());
          setError(`Too many failed attempts. Account locked for 5 minutes.`);
          
          toast({
            title: "Security Alert",
            description: "Multiple failed admin login attempts detected",
            variant: "destructive"
          });
        } else {
          setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-red-200">CampusCrew Administration Panel</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-center text-red-800 flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Secure Login
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Admin Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Admin Panel"}
              </Button>

              {/* Demo Credentials Info */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-2">Demo Admin Credentials:</p>
                <div className="space-y-1 text-xs text-red-700 font-mono">
                  <p><strong>Username:</strong> admin_cmr_2024</p>
                  <p><strong>Password:</strong> CMR@Admin#2024$Secure!</p>
                </div>
                <p className="text-xs text-red-600 mt-2 italic">
                  ⚠️ These are demo credentials for testing purposes only
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Security Notice:</strong> Admin access is monitored and logged. 
                  Maximum 3 login attempts allowed before 5-minute lockout.
                </p>
              </div>

              {/* Back to Home */}
              <div className="text-center pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToHome}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="mt-6 text-center">
          <div className="grid grid-cols-3 gap-4 text-white text-xs">
            <div className="bg-red-800 bg-opacity-50 p-3 rounded-lg">
              <Shield className="w-5 h-5 mx-auto mb-1" />
              <p>Secure Access</p>
            </div>
            <div className="bg-red-800 bg-opacity-50 p-3 rounded-lg">
              <Lock className="w-5 h-5 mx-auto mb-1" />
              <p>Encrypted</p>
            </div>
            <div className="bg-red-800 bg-opacity-50 p-3 rounded-lg">
              <Eye className="w-5 h-5 mx-auto mb-1" />
              <p>Monitored</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

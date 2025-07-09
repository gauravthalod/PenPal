import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Globe, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as FirebaseUser } from "firebase/auth";
import { UserProfile } from "@/contexts/AuthContext";

interface ProfileFormProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: any) => void;
  onCancel: () => void;
  currentUser: FirebaseUser;
  userProfile: UserProfile | null;
  onLogout: () => void;
}

const ProfileForm = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  currentUser,
  userProfile,
  onLogout
}: ProfileFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();



  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    phone: "",
    bio: ""
  });

  const [bioCharCount, setBioCharCount] = useState(0);
  const maxBioLength = 160;

  // Initialize profile data from Firebase user and profile
  useEffect(() => {
    if (currentUser && userProfile) {
      setProfileData({
        firstName: userProfile.firstName || currentUser.displayName?.split(' ')[0] || "",
        lastName: userProfile.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || "",
        location: userProfile.location || "",
        phone: userProfile.phone || currentUser.phoneNumber || "",
        bio: userProfile.bio || ""
      });
      setBioCharCount(userProfile.bio?.length || 0);
    } else if (currentUser) {
      // If we have currentUser but no userProfile, use basic info from Firebase Auth
      setProfileData(prev => ({
        ...prev,
        firstName: currentUser.displayName?.split(' ')[0] || "",
        lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || "",
        phone: currentUser.phoneNumber || ""
      }));
    }
  }, [currentUser, userProfile]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === "bio" && typeof value === "string") {
      setBioCharCount(value.length);
    }
  };

  const handleBioChange = (value: string) => {
    if (value.length <= maxBioLength) {
      handleInputChange("bio", value);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, Location).",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare data for saving
      const updatedData = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        location: profileData.location.trim(),
        phone: profileData.phone.trim(),
        bio: profileData.bio?.trim() || ''
      };

      console.log('🔄 Saving profile data:', updatedData);
      await onSave(updatedData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    if (currentUser.displayName) {
      const names = currentUser.displayName.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase();
    }
    return currentUser.email?.[0].toUpperCase() || "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return currentUser.displayName || currentUser.email || "User";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentUser.photoURL || "/placeholder-avatar.jpg"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xl font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
            </div>
            <div className="flex items-center gap-2">
              {profileData.location && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  📍 {profileData.location}
                </Badge>
              )}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {currentUser.email}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-4">
          <Label className="text-sm text-gray-600 flex items-center gap-1">
            <User className="w-4 h-4" />
            Bio <span className="text-gray-400">(optional)</span>
          </Label>
          {isEditing ? (
            <div className="mt-2">
              <Textarea
                placeholder="Share a little about yourself..."
                value={profileData.bio}
                onChange={(e) => handleBioChange(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {bioCharCount}/{maxBioLength}
              </div>
            </div>
          ) : (
            <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[80px] flex items-center">
              <span className="text-gray-500 italic">
                {profileData.bio || "Share a little about yourself..."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Private Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-blue-500" />
                Private Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Bangalore, Mumbai, Delhi"
                  className="mt-1"
                />
              </div>



              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser.email || ""}
                  disabled
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Public Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-green-500" />
                Public Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                Profile settings and preferences will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>

          {/* Edit/Save Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={onEdit} className="bg-blue-500 hover:bg-blue-600">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;

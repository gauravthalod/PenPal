import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, Lock, Globe, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileForm = ({ isEditing, onEdit, onSave, onCancel }: ProfileFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    username: "karthik",
    realName: "Karthik Reddy",
    college: "BITS Pilani",
    email: "karthik@bits.edu.in",
    phone: "+91 9876543210",
    bio: "",
    rating: 4.8,
    reviewCount: 37,
    anonMode: false
  });

  const [bioCharCount, setBioCharCount] = useState(0);
  const maxBioLength = 160;

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

  const handleLogout = () => {
    // Clear any stored authentication data (localStorage, sessionStorage, etc.)
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');

    // Show logout confirmation
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    // Navigate to login page
    navigate("/login");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xl font-semibold">
                K
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold">@{profileData.username}</h2>
              <div className="flex items-center gap-1">
                <Switch
                  checked={profileData.anonMode}
                  onCheckedChange={(checked) => handleInputChange("anonMode", checked)}
                  disabled={!isEditing}
                />
                <span className="text-sm text-gray-600">Anon mode off</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {profileData.college}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{profileData.rating}</span>
                <span className="text-gray-500">({profileData.reviewCount})</span>
              </div>
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
              <div>
                <Label htmlFor="realName">Real Name</Label>
                <Input
                  id="realName"
                  value={profileData.realName}
                  onChange={(e) => handleInputChange("realName", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={profileData.college}
                  onChange={(e) => handleInputChange("college", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
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
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={profileData.anonMode}
                  onCheckedChange={(checked) => handleInputChange("anonMode", checked)}
                  disabled={!isEditing}
                />
                <span className="text-sm">Anon mode off</span>
              </div>
              
              <div>
                <Label>Rating</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-lg">{profileData.rating}</span>
                  <span className="text-gray-500">({profileData.reviewCount} reviews)</span>
                </div>
              </div>
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
                <Button onClick={onSave} className="bg-blue-500 hover:bg-blue-600">
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

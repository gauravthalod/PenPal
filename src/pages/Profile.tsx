import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ProfileForm from "@/components/ProfileForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleBack = () => {
    navigate("/");
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the profile data
    console.log("Profile saved");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <ProfileForm
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;

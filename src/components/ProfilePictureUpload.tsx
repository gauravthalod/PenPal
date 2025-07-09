import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

interface ProfilePictureUploadProps {
  currentProfilePicture?: string;
  userInitials: string;
  userId: string;
  onProfilePictureUpdate: (newProfilePictureUrl: string) => void;
  isEditing?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentProfilePicture,
  userInitials,
  userId,
  onProfilePictureUpdate,
  isEditing = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-pictures/${userId}/${timestamp}.${fileExtension}`;
      
      // Create storage reference
      const storageRef = ref(storage, fileName);
      
      // Upload file
      console.log("📤 Uploading profile picture...");
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("✅ Profile picture uploaded successfully:", downloadURL);
      
      // Update profile picture
      onProfilePictureUpdate(downloadURL);
      setPreviewUrl(null);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
      
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
      setPreviewUrl(null);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!currentProfilePicture) return;
    
    setIsUploading(true);
    try {
      // If it's a Firebase Storage URL, try to delete it
      if (currentProfilePicture.includes('firebase')) {
        try {
          const storageRef = ref(storage, currentProfilePicture);
          await deleteObject(storageRef);
          console.log("✅ Old profile picture deleted from storage");
        } catch (error) {
          console.log("ℹ️ Could not delete old profile picture (may not exist):", error);
        }
      }
      
      // Update profile to remove picture
      onProfilePictureUpdate('');
      
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });
      
    } catch (error) {
      console.error("❌ Error removing profile picture:", error);
      toast({
        title: "Remove failed",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayImage = previewUrl || currentProfilePicture;

  return (
    <div className="relative">
      <Avatar className="w-16 h-16 cursor-pointer" onClick={isEditing ? triggerFileInput : undefined}>
        <AvatarImage 
          src={displayImage} 
          alt="Profile picture"
          className="object-cover"
        />
        <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xl font-semibold">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      {/* Upload overlay when editing */}
      {isEditing && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      )}

      {/* Verification badge */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs">✓</span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload controls when editing */}
      {isEditing && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          
          {currentProfilePicture && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveProfilePicture}
              disabled={isUploading}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          )}
        </div>
      )}

      {/* Upload instructions */}
      {isEditing && (
        <p className="text-xs text-gray-500 mt-2">
          Click on the avatar or upload button to change your profile picture. 
          Supported formats: JPG, PNG, GIF (max 5MB)
        </p>
      )}
    </div>
  );
};

export default ProfilePictureUpload;

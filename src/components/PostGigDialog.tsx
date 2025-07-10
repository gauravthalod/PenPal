import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { gigService } from "@/services/database";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface PostGigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (gigData: any) => void;
}

const PostGigDialog = ({ open, onOpenChange, onSubmit }: PostGigDialogProps) => {
  const { userProfile, currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gigName: "",
    category: "",
    bidPrice: "",
    deadline: "",
    description: ""
  });

  const categories = [
    "Academic",
    "Creative",
    "Tech",
    "Errands",
    "Events",
    "Others"
  ];

  // Generate deadline options with actual dates
  const generateDeadlineOptions = () => {
    const options = [];
    const today = new Date();

    // Add options for 1, 2, 3, 5 days, 1 week, 2 weeks
    const dayOptions = [1, 2, 3, 5, 7, 14];

    dayOptions.forEach(days => {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);

      const dateStr = futureDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      let label;
      if (days === 1) label = `1 day (${dateStr})`;
      else if (days === 7) label = `1 week (${dateStr})`;
      else if (days === 14) label = `2 weeks (${dateStr})`;
      else label = `${days} days (${dateStr})`;

      options.push({
        value: dateStr,
        label: label
      });
    });

    return options;
  };

  const deadlineOptions = generateDeadlineOptions();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.gigName || !formData.category || !formData.bidPrice || !formData.deadline) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate price
    const price = parseFloat(formData.bidPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(formData.deadline);
    const now = new Date();
    if (deadlineDate <= now) {
      toast({
        title: "Validation Error",
        description: "Deadline must be in the future.",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      console.error("❌ PostGig: No userProfile found");
      console.log("Current user:", currentUser);
      toast({
        title: "Authentication Error",
        description: "Please log in to post a gig.",
        variant: "destructive"
      });
      return;
    }

    // Check if profile is complete (only require essential fields)
    if (!userProfile.firstName || !userProfile.lastName || !userProfile.location) {
      console.error("❌ PostGig: Incomplete user profile", userProfile);
      toast({
        title: "Complete Your Profile",
        description: "Please add your name and location to start posting gigs.",
        variant: "destructive",
        action: (
          <ToastAction altText="Complete Profile" onClick={() => window.location.href = '/profile'}>
            Complete Profile
          </ToastAction>
        )
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create gig data for Firebase
      const gigData = {
        title: formData.gigName.trim(),
        description: formData.description?.trim() || "",
        category: formData.category,
        budget: price,
        deadline: deadlineDate,
        location: userProfile.location || "Remote", // Use user's location
        postedBy: userProfile.uid,
        postedByName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        status: 'open' as const
      };

      console.log("🚀 Posting gig with data:", gigData);
      console.log("🔍 User profile location:", userProfile.location);
      console.log("🔍 User ID:", userProfile.uid);
      console.log("🔍 User name:", `${userProfile.firstName} ${userProfile.lastName}`);

      // Save to Firebase
      const createdGig = await gigService.createGig(gigData);
      console.log("✅ Gig created successfully:", createdGig);

      // Set flag to trigger dashboard refresh
      localStorage.setItem('gigPosted', 'true');
      console.log("🔄 Set gigPosted flag for dashboard refresh");

      // Dispatch custom event for immediate dashboard refresh
      window.dispatchEvent(new CustomEvent('gigPosted', {
        detail: { gig: createdGig }
      }));
      console.log("📡 Dispatched gigPosted event for immediate refresh");

      toast({
        title: "Gig Posted Successfully!",
        description: `Your gig "${formData.gigName}" has been posted and will appear in your dashboard.`,
      });

      // Call onSubmit if provided (for any additional handling)
      onSubmit?.(createdGig);

      // Reset form
      setFormData({
        gigName: "",
        category: "",
        bidPrice: "",
        deadline: "",
        description: ""
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error posting gig:", error);
      toast({
        title: "Error",
        description: "Failed to post gig. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      gigName: "",
      category: "",
      bidPrice: "",
      deadline: "",
      description: ""
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-5 h-5 text-blue-500" />
            Post New Gig
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gig Name */}
          <div className="space-y-2">
            <Label htmlFor="gigName" className="text-sm font-medium">
              Gig Name *
            </Label>
            <Input
              id="gigName"
              placeholder="e.g., Math assignment help"
              value={formData.gigName}
              onChange={(e) => handleInputChange("gigName", e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Gig Category *
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bid Price */}
          <div className="space-y-2">
            <Label htmlFor="bidPrice" className="text-sm font-medium">
              Bid Price *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <Input
                id="bidPrice"
                type="number"
                placeholder="0"
                value={formData.bidPrice}
                onChange={(e) => handleInputChange("bidPrice", e.target.value)}
                className="pl-8"
                min="0"
                required
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium">
              Deadline *
            </Label>
            <Select value={formData.deadline} onValueChange={(value) => handleInputChange("deadline", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select deadline" />
              </SelectTrigger>
              <SelectContent>
                {deadlineOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-gray-400">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your gig..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Posting..." : "Post Gig"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostGigDialog;

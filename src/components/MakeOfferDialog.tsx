import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { offerService } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface MakeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (offerData: { gigId: string; offerPrice: number; message: string }) => void;
  gig: {
    id: string;
    title: string;
    price: number;
    poster: string;
    postedBy: string;
    postedByName: string;
  } | null;
}

const MakeOfferDialog = ({ open, onOpenChange, onSubmit, gig }: MakeOfferDialogProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    offerPrice: "",
    message: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.offerPrice || !formData.message || !gig) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Authentication Error",
        description: "Please log in to make an offer.",
        variant: "destructive"
      });
      return;
    }

    // Prevent users from making offers on their own gigs
    if (userProfile.uid === gig.postedBy) {
      toast({
        title: "Invalid Action",
        description: "You cannot make an offer on your own gig.",
        variant: "destructive"
      });
      return;
    }

    const offerPrice = parseFloat(formData.offerPrice);
    if (isNaN(offerPrice) || offerPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid offer price greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create offer data for Firebase
      const offerData = {
        gigId: gig.id,
        gigTitle: gig.title,
        offeredBy: userProfile.uid,
        offeredByName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        gigPostedBy: gig.postedBy,
        message: formData.message.trim(),
        proposedBudget: offerPrice,
        status: 'pending' as const
      };

      // Save to Firebase
      const createdOffer = await offerService.createOffer(offerData);

      toast({
        title: "Offer Submitted Successfully!",
        description: `Your offer of ₹${offerPrice} has been sent to the gig poster. You'll be notified when they respond.`,
      });

      // Call onSubmit if provided (for any additional handling)
      onSubmit?.({
        gigId: gig.id,
        offerPrice: offerPrice,
        message: formData.message.trim()
      });

      // Reset form
      setFormData({
        offerPrice: "",
        message: ""
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      offerPrice: "",
      message: ""
    });
    onOpenChange(false);
  };

  if (!gig) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Make Offer
          </DialogTitle>
        </DialogHeader>
        
        {/* Gig Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">{gig.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Posted by @{gig.poster}</span>
            <span className="font-semibold text-green-600">₹{gig.price}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Price */}
          <div className="space-y-2">
            <Label htmlFor="offerPrice" className="text-sm font-medium">
              Your Offer Price *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <Input
                id="offerPrice"
                type="number"
                placeholder="0"
                value={formData.offerPrice}
                onChange={(e) => handleInputChange("offerPrice", e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Original price: ₹{gig.price}
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Write a brief message to the gig poster..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="resize-none"
              rows={3}
              maxLength={200}
              required
            />
            <div className="text-right text-xs text-gray-500">
              {formData.message.length}/200
            </div>
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
              disabled={!formData.offerPrice || !formData.message || isLoading}
            >
              {isLoading ? "Sending..." : "Send Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeOfferDialog;

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { offerService } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface TakeOfferDialogProps {
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

const TakeOfferDialog = ({ open, onOpenChange, onSubmit, gig }: TakeOfferDialogProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!message.trim() || !gig) {
      toast({
        title: "Validation Error",
        description: "Please enter a message to the gig poster.",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Authentication Error",
        description: "Please log in to take this offer.",
        variant: "destructive"
      });
      return;
    }

    // Prevent users from taking their own gigs
    if (userProfile.uid === gig.postedBy) {
      toast({
        title: "Invalid Action",
        description: "You cannot take your own gig.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create offer data for Firebase (using original price)
      const offerData = {
        gigId: gig.id,
        gigTitle: gig.title,
        offeredBy: userProfile.uid,
        offeredByName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        gigPostedBy: gig.postedBy,
        message: message.trim(),
        proposedBudget: gig.price, // Use the original price
        status: 'pending' as const
      };

      // Save to Firebase
      const createdOffer = await offerService.createOffer(offerData);

      toast({
        title: "Offer Accepted Successfully!",
        description: `You've accepted the gig "${gig.title}" at the original price of ₹${gig.price}. The poster will be notified.`,
      });

      // Call onSubmit if provided (for any additional handling)
      onSubmit?.({
        gigId: gig.id,
        offerPrice: gig.price,
        message: message.trim()
      });

      // Reset form and close dialog
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error taking offer:", error);
      toast({
        title: "Error",
        description: "Failed to take offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Take Gig at Original Price
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gig Details */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-1">{gig?.title}</h3>
            <p className="text-sm text-gray-500 mb-2">Posted by: {gig?.poster}</p>
            <div className="flex items-center text-green-600 font-medium">
              <span>Original Price: ₹{gig?.price}</span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message to Gig Poster *
            </Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain why you're the right person for this gig..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={4}
              required
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
              className="flex-1 bg-green-500 hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Take Gig
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TakeOfferDialog;

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { offerService, Offer } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface EditOfferDialogProps {
  offer: Offer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferUpdated: (updatedOffer: Offer) => void;
}

interface FormData {
  message: string;
  proposedBudget: string;
}

export default function EditOfferDialog({ offer, open, onOpenChange, onOfferUpdated }: EditOfferDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    message: "",
    proposedBudget: ""
  });

  // Populate form when offer changes
  useEffect(() => {
    if (offer) {
      setFormData({
        message: offer.message || "",
        proposedBudget: offer.proposedBudget?.toString() || ""
      });
    }
  }, [offer]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!offer) return;

    // Check if offer can be edited (only pending offers)
    if (offer.status !== 'pending') {
      toast({
        title: "Cannot Edit Offer",
        description: "You can only edit pending offers.",
        variant: "destructive"
      });
      return;
    }

    // Validation
    if (!formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    const budget = parseFloat(formData.proposedBudget);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid budget amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Updating offer:", offer.id);
      
      const updateData = {
        message: formData.message.trim(),
        proposedBudget: budget
      };

      const updatedOffer = await offerService.updateOffer(offer.id!, updateData);
      
      console.log("✅ Offer updated successfully:", updatedOffer);

      toast({
        title: "Offer Updated!",
        description: "Your offer has been updated successfully.",
      });

      // Call the callback to update the parent component
      onOfferUpdated({ ...offer, ...updateData });
      
      // Close dialog
      onOpenChange(false);

    } catch (error) {
      console.error("❌ Error updating offer:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Offer</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1">{offer.gigTitle}</h4>
          <p className="text-sm text-gray-600">
            Editing your offer for this gig
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="proposedBudget">Proposed Budget (₹) *</Label>
            <Input
              id="proposedBudget"
              type="number"
              value={formData.proposedBudget}
              onChange={(e) => handleInputChange("proposedBudget", e.target.value)}
              placeholder="Enter your proposed budget"
              min="1"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Explain why you're the right person for this gig..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || offer.status !== 'pending'}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Offer"
              )}
            </Button>
          </div>

          {offer.status !== 'pending' && (
            <div className="text-sm text-gray-500 text-center mt-2">
              Only pending offers can be edited
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

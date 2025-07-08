import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { offerService, Offer } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface DeleteOfferDialogProps {
  offer: Offer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferDeleted: (offerId: string) => void;
}

export default function DeleteOfferDialog({ offer, open, onOpenChange, onOfferDeleted }: DeleteOfferDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!offer) return;

    // Check if offer can be deleted (only pending offers)
    if (offer.status !== 'pending') {
      toast({
        title: "Cannot Delete Offer",
        description: "You can only delete pending offers.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🗑️ Deleting offer:", offer.id);
      
      await offerService.deleteOffer(offer.id!);
      
      console.log("✅ Offer deleted successfully");

      toast({
        title: "Offer Deleted",
        description: "Your offer has been permanently deleted.",
      });

      // Call the callback to update the parent component
      onOfferDeleted(offer.id!);
      
      // Close dialog
      onOpenChange(false);

    } catch (error) {
      console.error("❌ Error deleting offer:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Offer
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to delete this offer? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-1">{offer.gigTitle}</h4>
          <p className="text-sm text-gray-600 mb-2">{offer.message}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Proposed Budget: ₹{offer.proposedBudget}</span>
            <span>Status: {offer.status}</span>
          </div>
        </div>

        {offer.status !== 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Only pending offers can be deleted. This offer has already been {offer.status}.
            </p>
          </div>
        )}

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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || offer.status !== 'pending'}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Offer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

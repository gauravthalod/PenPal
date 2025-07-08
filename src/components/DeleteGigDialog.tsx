import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { gigService, Gig } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface DeleteGigDialogProps {
  gig: Gig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGigDeleted: (gigId: string) => void;
}

export default function DeleteGigDialog({ gig, open, onOpenChange, onGigDeleted }: DeleteGigDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!gig) return;

    setLoading(true);

    try {
      console.log("🗑️ Deleting gig:", gig.id);
      
      await gigService.deleteGig(gig.id);
      
      console.log("✅ Gig deleted successfully");

      toast({
        title: "Gig Deleted",
        description: "Your gig has been permanently deleted.",
      });

      // Call the callback to update the parent component
      onGigDeleted(gig.id);
      
      // Close dialog
      onOpenChange(false);

    } catch (error) {
      console.error("❌ Error deleting gig:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete gig. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!gig) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Gig
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to delete this gig? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-1">{gig.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{gig.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Budget: ₹{gig.budget}</span>
            <span>Category: {gig.category}</span>
          </div>
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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Gig"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

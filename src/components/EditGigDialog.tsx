import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { gigService, Gig } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface EditGigDialogProps {
  gig: Gig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGigUpdated: (updatedGig: Gig) => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  budget: string;
  deadline: string;
  location: string;
}

const categories = [
  "Academic",
  "Creative", 
  "Tech",
  "Event",
  "Other"
];

export default function EditGigDialog({ gig, open, onOpenChange, onGigUpdated }: EditGigDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
    location: ""
  });

  // Populate form when gig changes
  useEffect(() => {
    if (gig) {
      setFormData({
        title: gig.title || "",
        description: gig.description || "",
        category: gig.category || "",
        budget: gig.budget?.toString() || "",
        deadline: gig.deadline ? new Date(gig.deadline).toISOString().split('T')[0] : "",
        location: gig.location || ""
      });
    }
  }, [gig]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gig) return;

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a gig title",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please enter a description",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid budget amount",
        variant: "destructive"
      });
      return;
    }

    if (!formData.deadline) {
      toast({
        title: "Validation Error",
        description: "Please select a deadline",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Updating gig:", gig.id);
      
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budget: budget,
        deadline: new Date(formData.deadline),
        location: formData.location.trim()
      };

      const updatedGig = await gigService.updateGig(gig.id, updateData);
      
      console.log("✅ Gig updated successfully:", updatedGig);

      toast({
        title: "Gig Updated!",
        description: "Your gig has been updated successfully.",
      });

      // Call the callback to update the parent component
      onGigUpdated({ ...gig, ...updateData });
      
      // Close dialog
      onOpenChange(false);

    } catch (error) {
      console.error("❌ Error updating gig:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update gig. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!gig) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Gig</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Gig Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter gig title"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what you need help with"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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

          <div>
            <Label htmlFor="budget">Budget (₹) *</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              placeholder="Enter budget amount"
              min="1"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Where should the work be done?"
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
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Gig"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

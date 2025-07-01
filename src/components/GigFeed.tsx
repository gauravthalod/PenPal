
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ChevronDown, Tag, DollarSign, Calendar } from "lucide-react";
import GigCard from "./GigCard";
import PostGigDialog from "./PostGigDialog";
import MakeOfferDialog from "./MakeOfferDialog";

interface Gig {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  deadline: string;
  poster: string;
  university: string;
  timePosted: string;
}

interface GigFeedProps {
  gigs: Gig[];
  onMakeOffer?: (offerData: { gigId: number; offerPrice: number; message: string }) => void;
  onPostGig?: (gigData: any) => void;
}

const GigFeed = ({ gigs, onMakeOffer, onPostGig }: GigFeedProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [showPostGigDialog, setShowPostGigDialog] = useState(false);
  const [showMakeOfferDialog, setShowMakeOfferDialog] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);

  const mainCategories = ["Academic", "Creative", "Tech", "Errands", "Events"];

  const filteredGigs = gigs.filter(gig => {
    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      if (selectedCategory === "Others") {
        // Show gigs that don't belong to main categories
        if (mainCategories.includes(gig.category)) return false;
      } else {
        // Show gigs that match the selected category
        if (gig.category !== selectedCategory) return false;
      }
    }

    // Price filter
    if (selectedPrice && selectedPrice !== "All") {
      const price = gig.price;
      if (selectedPrice === "0-100" && (price < 0 || price > 100)) return false;
      if (selectedPrice === "100-500" && (price < 100 || price > 500)) return false;
      if (selectedPrice === "500+" && price < 500) return false;
    }

    // Deadline filter
    if (selectedDeadline && selectedDeadline !== "All") {
      const today = new Date();
      const gigDeadlineDate = new Date(gig.deadline);
      const daysDiff = Math.ceil((gigDeadlineDate - today) / (1000 * 60 * 60 * 24));

      if (selectedDeadline === "1-days" && daysDiff !== 1) return false;
      if (selectedDeadline === "2-days" && daysDiff !== 2) return false;
      if (selectedDeadline === "3-days" && daysDiff !== 3) return false;
      if (selectedDeadline === "5-days" && daysDiff !== 5) return false;
      if (selectedDeadline === "7-days" && daysDiff !== 7) return false;
      if (selectedDeadline === "14-days" && daysDiff !== 14) return false;
    }

    return true;
  });

  const handlePostGigSubmit = (gigData: any) => {
    onPostGig?.(gigData);
  };

  const handleMakeOfferClick = (gig: Gig) => {
    setSelectedGig(gig);
    setShowMakeOfferDialog(true);
  };

  const handleMakeOfferSubmit = (offerData: { gigId: number; offerPrice: number; message: string }) => {
    onMakeOffer?.(offerData);
  };

  // Generate deadline options with actual dates for filter
  const generateDeadlineFilterOptions = () => {
    const options = [];
    const today = new Date();

    // Add "All" option first
    options.push({ value: "All", label: "All" });

    // Add options for 1, 2, 3, 5 days, 1 week, 2 weeks
    const dayOptions = [1, 2, 3, 5, 7, 14];

    dayOptions.forEach(days => {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);

      const dateStr = futureDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      let label;
      if (days === 1) label = `1 day (${dateStr})`;
      else if (days === 7) label = `1 week (${dateStr})`;
      else if (days === 14) label = `2 weeks (${dateStr})`;
      else label = `${days} days (${dateStr})`;

      options.push({
        value: `${days}-days`,
        label: label
      });
    });

    return options;
  };

  const deadlineFilterOptions = generateDeadlineFilterOptions();

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 text-sm sm:text-base">
          <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Browse Gigs
        </Button>
        <Button
          variant="outline"
          className="px-4 sm:px-6 border-gray-300 text-sm sm:text-base"
          onClick={() => setShowPostGigDialog(true)}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Post Gig
        </Button>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300">
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Academic">Academic</SelectItem>
            <SelectItem value="Creative">Creative</SelectItem>
            <SelectItem value="Tech">Tech</SelectItem>
            <SelectItem value="Errands">Errands</SelectItem>
            <SelectItem value="Events">Events</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPrice} onValueChange={setSelectedPrice}>
          <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <SelectValue placeholder="Price" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="0-100">₹0 - ₹100</SelectItem>
            <SelectItem value="100-500">₹100 - ₹500</SelectItem>
            <SelectItem value="500+">₹500+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDeadline} onValueChange={setSelectedDeadline}>
          <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <SelectValue placeholder="Deadline" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {deadlineFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gigs List */}
      <div className="space-y-4">
        {filteredGigs.map((gig) => (
          <GigCard
            key={gig.id}
            gig={gig}
            onMakeOffer={() => handleMakeOfferClick(gig)}
          />
        ))}
      </div>

      {/* Post Gig Dialog */}
      <PostGigDialog
        open={showPostGigDialog}
        onOpenChange={setShowPostGigDialog}
        onSubmit={handlePostGigSubmit}
      />

      {/* Make Offer Dialog */}
      <MakeOfferDialog
        open={showMakeOfferDialog}
        onOpenChange={setShowMakeOfferDialog}
        onSubmit={handleMakeOfferSubmit}
        gig={selectedGig}
      />
    </div>
  );
};

export default GigFeed;

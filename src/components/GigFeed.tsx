
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ChevronDown, Tag, DollarSign, Calendar, Loader2, X, RefreshCw } from "lucide-react";
import GigCard from "./GigCard";
import PostGigDialog from "./PostGigDialog";
import MakeOfferDialog from "./MakeOfferDialog";
import { Gig } from "@/services/database";
import { useAuth } from "@/contexts/AuthContext";

// Transform Firebase Gig to component Gig format
interface ComponentGig {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deadline: string;
  poster: string;
  university: string;
  timePosted: string;
  postedBy: string;
  postedByName: string;
}

interface GigFeedProps {
  gigs: Gig[];
  loading?: boolean;
  onMakeOffer?: (offerData: { gigId: string; offerPrice: number; message: string }) => void;
  onPostGig?: (gigData: any) => void;
  onRefresh?: () => void;
}

const GigFeed = ({ gigs, loading = false, onMakeOffer, onPostGig, onRefresh }: GigFeedProps) => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [showPostGigDialog, setShowPostGigDialog] = useState(false);
  const [showMakeOfferDialog, setShowMakeOfferDialog] = useState(false);
  const [selectedGig, setSelectedGig] = useState<ComponentGig | null>(null);

  const mainCategories = ["Academic", "Creative", "Tech", "Errands", "Events"];

  // Transform Firebase gigs to component format
  const transformedGigs: ComponentGig[] = gigs.map(gig => {
    const createdAt = gig.createdAt instanceof Date ? gig.createdAt : new Date(gig.createdAt);
    const deadline = gig.deadline instanceof Date ? gig.deadline : new Date(gig.deadline);

    // Calculate time posted
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let timePosted;
    if (diffDays > 0) {
      timePosted = `${diffDays}d ago`;
    } else if (diffHours > 0) {
      timePosted = `${diffHours}h ago`;
    } else {
      timePosted = "Just now";
    }

    return {
      id: gig.id || '',
      title: gig.title,
      description: gig.description,
      category: gig.category,
      price: gig.budget,
      deadline: deadline.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      poster: gig.postedByName.split(' ')[0], // First name only for privacy
      university: gig.college,
      timePosted,
      postedBy: gig.postedBy,
      postedByName: gig.postedByName
    };
  });

  const filteredGigs = transformedGigs.filter(gig => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = gig.title.toLowerCase().includes(query);
      const matchesDescription = gig.description.toLowerCase().includes(query);
      const matchesCategory = gig.category.toLowerCase().includes(query);
      const matchesPoster = gig.poster.toLowerCase().includes(query);

      if (!matchesTitle && !matchesDescription && !matchesCategory && !matchesPoster) {
        return false;
      }
    }
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
    // Don't auto-refresh to avoid errors - user can manually refresh
  };

  const handleMakeOfferClick = (gig: ComponentGig) => {
    // Additional check to prevent offers on own gigs (UI level)
    if (userProfile && userProfile.uid === gig.postedBy) {
      return; // Don't open dialog for own gigs
    }
    setSelectedGig(gig);
    setShowMakeOfferDialog(true);
  };

  const handleMakeOfferSubmit = (offerData: { gigId: string; offerPrice: number; message: string }) => {
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
        <Button
          variant="outline"
          className="px-4 sm:px-6 border-gray-300 text-sm sm:text-base"
          onClick={() => onRefresh?.()}
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search gigs by title, description, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-white border-gray-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading gigs...</span>
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory || selectedPrice || selectedDeadline
                ? "No gigs found"
                : "No gigs available"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory || selectedPrice || selectedDeadline
                ? "Try adjusting your search or filters"
                : "Be the first to post a gig!"}
            </p>
            {!searchQuery && !selectedCategory && !selectedPrice && !selectedDeadline && (
              <Button
                onClick={() => setShowPostGigDialog(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Gig
              </Button>
            )}
          </div>
        ) : (
          filteredGigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              onMakeOffer={() => handleMakeOfferClick(gig)}
            />
          ))
        )}
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

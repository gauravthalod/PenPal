
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import GigCard from "./GigCard";

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
  onMakeOffer?: (gigId: number) => void;
}

const GigFeed = ({ gigs, onMakeOffer }: GigFeedProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = ["All", "Academic", "Creative", "Tech", "Errands", "Events"];

  const filteredGigs = selectedCategory === "All" 
    ? gigs 
    : gigs.filter(gig => gig.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white flex-1 sm:flex-none">
          <Search className="w-4 h-4 mr-2" />
          Browse Gigs
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none">
          Post Gig
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={category === selectedCategory ? "default" : "secondary"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search gigs..."
          className="pl-10"
        />
      </div>

      {/* Gigs List */}
      <div className="space-y-4">
        {filteredGigs.map((gig) => (
          <GigCard 
            key={gig.id} 
            gig={gig} 
            onMakeOffer={onMakeOffer}
          />
        ))}
      </div>
    </div>
  );
};

export default GigFeed;


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, User } from "lucide-react";

interface GigCardProps {
  gig: {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    deadline: string;
    poster: string;
    university: string;
    timePosted: string;
  };
  onMakeOffer?: (gigId: number) => void;
}

const GigCard = ({ gig, onMakeOffer }: GigCardProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return '📝';
      case 'creative':
        return '🎨';
      case 'tech':
        return '💻';
      case 'errands':
        return '📦';
      default:
        return '📋';
    }
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(gig.category)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{gig.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <Calendar className="w-4 h-4" />
                <span>{gig.deadline}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">₹{gig.price}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>@{gig.poster}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="text-blue-600">{gig.university}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{gig.timePosted}</span>
          <Button 
            onClick={() => onMakeOffer?.(gig.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
          >
            Make Offer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GigCard;


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, User, Calendar, MessageSquare } from "lucide-react";

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
  onMakeOffer?: () => void;
}

const GigCard = ({ gig, onMakeOffer }: GigCardProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return <Edit className="w-5 h-5 text-blue-500" />;
      case 'creative':
        return <Edit className="w-5 h-5 text-purple-500" />;
      case 'tech':
        return <Edit className="w-5 h-5 text-green-500" />;
      case 'errands':
        return <Edit className="w-5 h-5 text-orange-500" />;
      default:
        return <Edit className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-lg">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex items-start space-x-3 mb-3">
            {getCategoryIcon(gig.category)}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">{gig.title}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{gig.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {gig.category}
              </Badge>
              <span className="text-lg font-bold text-green-600">₹{gig.price}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{gig.deadline}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>@{gig.poster}</span>
              <span>•</span>
              <span>{gig.university}</span>
            </div>
            <Button
              onClick={onMakeOffer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5"
              size="sm"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              <span className="text-xs">Offer</span>
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getCategoryIcon(gig.category)}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{gig.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{gig.description}</p>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <span className="text-green-600 font-semibold">₹{gig.price}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>@{gig.poster}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-blue-600">{gig.university}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {gig.category}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-3">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{gig.deadline}</span>
            </div>

            <Button
              onClick={onMakeOffer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Make Offer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GigCard;

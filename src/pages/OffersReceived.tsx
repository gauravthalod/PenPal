import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HandCoins, Check, X, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  username: string;
  college: string;
  offerPrice: number;
  message: string;
  timeSubmitted: string;
  status: "pending" | "accepted" | "rejected";
}

const OffersReceived = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock gig data
  const gigData = {
    id: 1,
    title: "Math assignment help",
    description: "Need quick help with calculus assignment. Deadline within 2 days. Will provide all materials.",
    originalPrice: 200,
    deadline: "2 days",
    college: "CMREC"
  };

  const [offers, setOffers] = useState<Offer[]>([
    {
      id: "1",
      username: "mathwiz",
      college: "CMRIT",
      offerPrice: 180,
      message: "I can deliver within 24h, have helped many with calculus!",
      timeSubmitted: "2 hours ago",
      status: "pending"
    },
    {
      id: "2",
      username: "calcpro",
      college: "CMRTC",
      offerPrice: 200,
      message: "Guaranteed A+, send me the file and I'll get started right away!",
      timeSubmitted: "4 hours ago",
      status: "pending"
    },
    {
      id: "3",
      username: "anil_s",
      college: "CMRCET",
      offerPrice: 150,
      message: "Happy to do it for 150, let me know if you need a sample.",
      timeSubmitted: "6 hours ago",
      status: "pending"
    }
  ]);

  const handleBack = () => {
    navigate("/");
  };

  const handleAcceptOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: "accepted" as const }
          : offer
      )
    );
    
    const acceptedOffer = offers.find(offer => offer.id === offerId);
    toast({
      title: "Offer Accepted",
      description: `You accepted @${acceptedOffer?.username}'s offer of ₹${acceptedOffer?.offerPrice}`,
    });
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: "rejected" as const }
          : offer
      )
    );
    
    const rejectedOffer = offers.find(offer => offer.id === offerId);
    toast({
      title: "Offer Rejected",
      description: `You rejected @${rejectedOffer?.username}'s offer`,
    });
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const pendingOffers = offers.filter(offer => offer.status === "pending");
  const processedOffers = offers.filter(offer => offer.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Gig Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-gray-900 mb-2">
                  {gigData.title}
                </CardTitle>
                <p className="text-gray-600 mb-3">{gigData.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <span>₹{gigData.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{gigData.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{gigData.college}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Offers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HandCoins className="w-6 h-6 text-blue-500" />
              Offers Received
              <Badge className="bg-blue-500 text-white">
                {pendingOffers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {offers.length === 0 ? (
              <div className="text-center py-8">
                <HandCoins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
                <p className="text-gray-500">Check back later for offers on your gig.</p>
              </div>
            ) : (
              <>
                {/* Pending Offers */}
                {pendingOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                          {getInitials(offer.username)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">@{offer.username}</h4>
                          <Badge variant="outline" className="text-xs">
                            {offer.college}
                          </Badge>
                          <span className="text-xs text-gray-500">{offer.timeSubmitted}</span>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-green-600">₹{offer.offerPrice}</span>
                          {offer.offerPrice !== gigData.originalPrice && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Original: ₹{gigData.originalPrice})
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-4">{offer.message}</p>
                        
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRejectOffer(offer.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Processed Offers */}
                {processedOffers.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Processed Offers</h3>
                    {processedOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className={`border rounded-lg p-4 ${
                          offer.status === "accepted" 
                            ? "bg-green-50 border-green-200" 
                            : "bg-gray-50 border-gray-200"
                        } opacity-75`}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                              {getInitials(offer.username)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">@{offer.username}</h4>
                              <Badge 
                                className={
                                  offer.status === "accepted" 
                                    ? "bg-green-500 text-white" 
                                    : "bg-gray-500 text-white"
                                }
                              >
                                {offer.status === "accepted" ? "Accepted" : "Rejected"}
                              </Badge>
                              <span className="text-xs text-gray-500">{offer.timeSubmitted}</span>
                            </div>
                            
                            <div className="mb-2">
                              <span className="text-xl font-bold text-green-600">₹{offer.offerPrice}</span>
                            </div>
                            
                            <p className="text-gray-600">{offer.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OffersReceived;

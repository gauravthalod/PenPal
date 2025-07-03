import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageCircle, Clock, User, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { offerService, Offer } from "@/services/database";
import { chatService } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";

interface OfferManagementProps {
  gigId: string;
  gigTitle: string;
  onOfferAccepted?: (offer: Offer) => void;
}

const OfferManagement = ({ gigId, gigTitle, onOfferAccepted }: OfferManagementProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);

  // Fetch offers for this gig
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const fetchedOffers = await offerService.getOffersForGig(gigId);
      setOffers(fetchedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Error",
        description: "Failed to load offers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gigId) {
      fetchOffers();
    }
  }, [gigId]);

  const handleAcceptOffer = async (offer: Offer) => {
    if (!offer.id || !userProfile) return;

    setProcessingOfferId(offer.id);
    try {
      // Update offer status
      await offerService.updateOfferStatus(offer.id, 'accepted');

      // Create chat between gig poster and offer maker
      const chat = await chatService.createChat({
        participants: [userProfile.uid, offer.offeredBy],
        participantNames: [
          `${userProfile.firstName} ${userProfile.lastName}`.trim(),
          offer.offeredByName
        ],
        gigId: offer.gigId,
        gigTitle: offer.gigTitle,
        offerId: offer.id
      });

      // Update local state
      setOffers(prev => prev.map(o =>
        o.id === offer.id ? { ...o, status: 'accepted' } : o
      ));

      toast({
        title: "Offer Accepted!",
        description: `You've accepted ${offer.offeredByName}'s offer. A chat has been created for you to discuss details.`,
      });

      // Notify parent component with both offer and chat info
      onOfferAccepted?.({ ...offer, status: 'accepted' });

    } catch (error) {
      console.error("Error accepting offer:", error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleRejectOffer = async (offer: Offer) => {
    if (!offer.id) return;
    
    setProcessingOfferId(offer.id);
    try {
      await offerService.updateOfferStatus(offer.id, 'rejected');
      
      // Update local state
      setOffers(prev => prev.map(o => 
        o.id === offer.id ? { ...o, status: 'rejected' } : o
      ));
      
      toast({
        title: "Offer Rejected",
        description: `You've rejected ${offer.offeredByName}'s offer.`,
      });
      
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast({
        title: "Error",
        description: "Failed to reject offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingOfferId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600"><Check className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return "Just now";
    }
  };

  const pendingOffers = offers.filter(offer => offer.status === 'pending');
  const processedOffers = offers.filter(offer => offer.status !== 'pending');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Offers for "{gigTitle}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading offers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Offers for "{gigTitle}"
        </CardTitle>
        <p className="text-sm text-gray-600">
          {offers.length} total offers • {pendingOffers.length} pending
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {offers.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
            <p className="text-gray-500">Check back later for offers on your gig.</p>
          </div>
        ) : (
          <>
            {/* Pending Offers */}
            {pendingOffers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Pending Offers</h4>
                {pendingOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                          {getInitials(offer.offeredByName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-900">{offer.offeredByName}</h5>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatTimeAgo(offer.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">₹{offer.proposedBudget}</p>
                            {getStatusBadge(offer.status)}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{offer.message}</p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOffer(offer)}
                            disabled={processingOfferId === offer.id}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {processingOfferId === offer.id ? "Accepting..." : "Accept"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectOffer(offer)}
                            disabled={processingOfferId === offer.id}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            {processingOfferId === offer.id ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Processed Offers */}
            {processedOffers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Previous Offers</h4>
                {processedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-400 text-white">
                          {getInitials(offer.offeredByName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-700">{offer.offeredByName}</h5>
                            <p className="text-sm text-gray-500">{formatTimeAgo(offer.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-600">₹{offer.proposedBudget}</p>
                            {getStatusBadge(offer.status)}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm">{offer.message}</p>
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
  );
};

export default OfferManagement;

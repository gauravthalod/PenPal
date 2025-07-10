
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import NavigationTabs from "@/components/NavigationTabs";
import GigFeed from "@/components/GigFeed";
import SplashWrapper from "@/components/SplashWrapper";
import Buzz from "./Buzz";

import { useAuth } from "@/contexts/AuthContext";

import { gigService, Gig, offerService } from "@/services/database";


const Index = () => {
  const [activeTab, setActiveTab] = useState("trade");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();


  const fetchGigs = async () => {
    if (!userProfile?.uid) {

      setGigs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);



      const fetchedGigs = await gigService.getAllGigs(50, userProfile.uid);

      setGigs(fetchedGigs);


    } catch (error) {



      if (error.code === 'permission-denied') {
        toast({
          title: "Permission Error",
          description: "Please log in to view available gigs.",
          variant: "destructive"
        });
        setGigs([]);
      } else {

        toast({
          title: "Connection Issue",
          description: "Having trouble loading latest gigs. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [userProfile?.uid]);

  const handleMakeOffer = async (offerData: { gigId: string; offerPrice: number; message: string }) => {
    try {
      if (!userProfile) {
        toast({
          title: "Authentication Error",
          description: "Please log in to make an offer.",
          variant: "destructive"
        });
        return;
      }

      const offer = {
        gigId: offerData.gigId,
        gigTitle: gigs.find(g => g.id === offerData.gigId)?.title || "Unknown Gig",
        offeredBy: userProfile.uid,
        offeredByName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        gigPostedBy: gigs.find(g => g.id === offerData.gigId)?.postedBy || "",
        message: offerData.message,
        proposedBudget: offerData.offerPrice,
        status: 'pending' as const
      };

      await offerService.createOffer(offer);

      toast({
        title: "Offer Submitted!",
        description: "Your offer has been sent to the gig poster.",
      });
    } catch (error) {
      console.error("Error making offer:", error);
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTakeOffer = async (offerData: { gigId: string; offerPrice: number; message: string }) => {
    try {
      if (!userProfile) {
        toast({
          title: "Authentication Error",
          description: "Please log in to take this offer.",
          variant: "destructive"
        });
        return;
      }

      const offer = {
        gigId: offerData.gigId,
        gigTitle: gigs.find(g => g.id === offerData.gigId)?.title || "Unknown Gig",
        offeredBy: userProfile.uid,
        offeredByName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        gigPostedBy: gigs.find(g => g.id === offerData.gigId)?.postedBy || "",
        message: offerData.message,
        proposedBudget: offerData.offerPrice, // This will be the original price
        status: 'pending' as const
      };

      await offerService.createOffer(offer);

      toast({
        title: "Gig Accepted!",
        description: `You've accepted the gig at ₹${offerData.offerPrice}. The poster will be notified.`,
      });
    } catch (error) {
      console.error("Error taking offer:", error);
      toast({
        title: "Error",
        description: "Failed to take offer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePostGig = () => {
    fetchGigs();
  };

  const handleLogin = () => {
    // Handled by Header component
  };

  return (
    <SplashWrapper>
      <div className="min-h-screen bg-gray-50">
        <Header onLoginClick={handleLogin} />

        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "trade" && (
            <div className="mt-4 sm:mt-6">
              <GigFeed
                gigs={gigs}
                loading={loading}
                onMakeOffer={handleMakeOffer}
                onTakeOffer={handleTakeOffer}
                onPostGig={handlePostGig}
                onRefresh={fetchGigs}
              />
            </div>
          )}

          {activeTab === "buzz" && (
            <div className="mt-4 sm:mt-6">
              <Buzz />
            </div>
          )}
        </div>
      </div>
    </SplashWrapper>
  );
};

export default Index;

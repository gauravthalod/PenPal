
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import NavigationTabs from "@/components/NavigationTabs";
import GigFeed from "@/components/GigFeed";
import SplashWrapper from "@/components/SplashWrapper";
import Buzz from "./Buzz";

import { useAuth } from "@/contexts/AuthContext";

import { gigService, Gig } from "@/services/database";


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

  const handleMakeOffer = () => {
    // Handled in MakeOfferDialog component
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

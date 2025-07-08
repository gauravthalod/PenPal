
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import NavigationTabs from "@/components/NavigationTabs";
import GigFeed from "@/components/GigFeed";
import SplashWrapper from "@/components/SplashWrapper";
import Buzz from "./Buzz";
import { Plus, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSplash } from "@/contexts/SplashContext";
import { gigService, Gig } from "@/services/database";


const Index = () => {
  const [activeTab, setActiveTab] = useState("trade");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { showSplash } = useSplash();

  // Generate mock data for testing when user is not authenticated
  const generateMockGigs = (): Gig[] => {
    const today = new Date();
    const getDateString = (daysFromNow: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + daysFromNow);
      return date;
    };

    return [
      {
        id: "mock-1",
        title: "Math assignment help",
        description: "Need help with calculus assignment. Will provide all materials.",
        category: "Academic",
        budget: 200,
        deadline: getDateString(2),
        location: "Campus",
        college: "CMREC",
        postedBy: "mock-user-1",
        postedByName: "John Doe",
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "mock-2",
        title: "Graphic design for club event",
        description: "Looking for someone to design poster for our college fest",
        category: "Creative",
        budget: 500,
        deadline: getDateString(5),
        location: "Campus",
        college: "CMRIT",
        postedBy: "mock-user-2",
        postedByName: "Jane Smith",
        status: 'open',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];
  };

  // Fetch gigs from Firebase
  const fetchGigs = async () => {
    console.log("🔍 fetchGigs called, userProfile:", userProfile);

    if (!userProfile?.college) {
      console.log("⚠️ No user profile or college found, using mock data");
      setGigs(generateMockGigs());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Fetching gigs for college:", userProfile.college);
      console.log("🔍 Current user ID:", userProfile.uid);

      let fetchedGigs;
      try {
        // Try to get gigs by college first
        fetchedGigs = await gigService.getGigsByCollege(userProfile.college);
        console.log("✅ College-specific fetch successful, found:", fetchedGigs.length, "gigs");
      } catch (collegeError) {
        console.warn("⚠️ College-specific fetch failed, trying to get all gigs:", collegeError);
        // Fallback: get all gigs and filter client-side
        const allGigs = await gigService.getAllGigs();
        console.log("📋 All gigs from database:", allGigs.length);
        fetchedGigs = allGigs.filter(gig => {
          console.log(`🔍 Checking gig: "${gig.title}" - College: "${gig.college}" vs "${userProfile.college}" - Status: "${gig.status}"`);
          return gig.college === userProfile.college && gig.status === 'open';
        });
        console.log("✅ Filtered gigs for college:", fetchedGigs.length);
      }

      // Log details about each fetched gig
      fetchedGigs.forEach((gig, index) => {
        console.log(`📋 Gig ${index + 1}: "${gig.title}" by ${gig.postedByName} (${gig.postedBy}) - College: ${gig.college}`);
      });

      console.log("🎯 Final fetched gigs:", fetchedGigs);
      setGigs(fetchedGigs);

      // Show success message if we got gigs
      if (fetchedGigs.length > 0) {
        console.log(`✅ Successfully loaded ${fetchedGigs.length} gigs`);
      } else {
        console.log("⚠️ No gigs found for college:", userProfile.college);
      }
    } catch (error) {
      console.error("❌ Error fetching gigs:", error);

      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        toast({
          title: "Permission Error",
          description: "Please log in to view gigs for your college.",
          variant: "destructive"
        });
        setGigs([]);
      } else {
        // For other errors, show the gigs that are already stored
        console.log("❌ Error occurred, keeping existing gigs or showing empty state");
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

  // Fetch gigs when component mounts or user profile changes
  useEffect(() => {
    fetchGigs(); // Always fetch, will use mock data if not authenticated
  }, [userProfile?.college]);

  const handleMakeOffer = (offerData: { gigId: string; offerPrice: number; message: string }) => {
    // The offer submission is now handled in MakeOfferDialog component
    // This callback is just for any additional handling if needed
    console.log("Offer submitted:", offerData);
  };

  const handlePostGig = (gigData: any) => {
    // Refresh gigs list after posting
    fetchGigs();
  };

  const handleLogin = () => {
    // This will be handled by the Header component now
    console.log("Login clicked");
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

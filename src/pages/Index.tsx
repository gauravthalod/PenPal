
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
        location: "Bangalore",
        postedBy: "mock-user-1",
        postedByName: "John Doe",
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "mock-2",
        title: "Graphic design for club event",
        description: "Looking for someone to design poster for our community fest",
        category: "Creative",
        budget: 500,
        deadline: getDateString(5),
        location: "Mumbai",
        postedBy: "mock-user-2",
        postedByName: "Jane Smith",
        status: 'open',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: "mock-3",
        title: "Math tutoring needed",
        description: "Looking for help with calculus and statistics",
        category: "Academic",
        budget: 400,
        deadline: getDateString(7),
        location: "Delhi",
        postedBy: "mock-user-3",
        postedByName: "Alex Johnson",
        status: 'open',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: "mock-4",
        title: "Event photography",
        description: "Need photographer for cultural fest",
        category: "Creative",
        budget: 800,
        deadline: getDateString(10),
        location: "Chennai",
        postedBy: "mock-user-4",
        postedByName: "Sarah Wilson",
        status: 'open',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    ];
  };

  // Fetch gigs from Firebase
  const fetchGigs = async () => {
    console.log("🔍 fetchGigs called, userProfile:", userProfile);

    if (!userProfile?.uid) {
      console.log("⚠️ No user profile found, using mock data");
      setGigs(generateMockGigs());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🌍 Fetching all available gigs");
      console.log("🔍 Current user ID:", userProfile.uid);

      // Get all gigs, excluding user's own gigs
      const fetchedGigs = await gigService.getAllGigs(50, userProfile.uid);
      console.log("✅ Successfully fetched gigs (excluding own):", fetchedGigs.length);

      // Log details about each fetched gig
      fetchedGigs.forEach((gig, index) => {
        console.log(`📋 Gig ${index + 1}: "${gig.title}" by ${gig.postedByName} (${gig.postedBy}) - Location: ${gig.location || 'Not specified'}`);
      });

      console.log("🎯 Final fetched gigs:", fetchedGigs);
      setGigs(fetchedGigs);

      // Show success message if we got gigs
      if (fetchedGigs.length > 0) {
        console.log(`✅ Successfully loaded ${fetchedGigs.length} gigs from all locations`);
        const locations = [...new Set(fetchedGigs.map(g => g.location))];
        console.log("📍 Locations represented:", locations);
      } else {
        console.log("⚠️ No gigs found in database");
      }
    } catch (error) {
      console.error("❌ Error fetching gigs:", error);

      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        toast({
          title: "Permission Error",
          description: "Please log in to view available gigs.",
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
  }, [userProfile?.uid]); // Changed from college to uid since we now fetch all gigs

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

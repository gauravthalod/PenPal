
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import NavigationTabs from "@/components/NavigationTabs";
import GigFeed from "@/components/GigFeed";
import Buzz from "./Buzz";
import { Plus, MessageCircle } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("trade");
  const { toast } = useToast();

  // Generate mock data with actual dates
  const generateMockGigs = () => {
    const today = new Date();

    const getDateString = (daysFromNow: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + daysFromNow);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    return [
      {
        id: 1,
        title: "Math assignment help",
        description: "Need help with calculus assignment. Will provide all materials.",
        category: "Academic",
        price: 200,
        deadline: getDateString(2),
        poster: "anon_47",
        university: "CMREC",
        timePosted: "2h ago"
      },
      {
        id: 2,
        title: "Graphic design for club event",
        description: "Looking for someone to design poster for our college fest",
        category: "Creative",
        price: 500,
        deadline: getDateString(5),
        poster: "anon_99",
        university: "CMRIT",
        timePosted: "4h ago"
      },
      {
        id: 3,
        title: "Resume Review",
        description: "Need professional review of my resume for internship applications",
        category: "Academic",
        price: 100,
        deadline: getDateString(1),
        poster: "anon_12",
        university: "CMRTC",
        timePosted: "1h ago"
      },
      {
        id: 4,
        title: "Pet sitting service",
        description: "Need someone to take care of my dog for the weekend",
        category: "Others",
        price: 300,
        deadline: getDateString(3),
        poster: "anon_88",
        university: "CMRCET",
        timePosted: "6h ago"
      },
      {
        id: 5,
        title: "Website development",
        description: "Looking for a developer to create a simple portfolio website",
        category: "Tech",
        price: 800,
        deadline: getDateString(14),
        poster: "anon_55",
        university: "CMREC",
        timePosted: "1d ago"
      }
    ];
  };

  const mockGigs = generateMockGigs();

  const handleMakeOffer = (offerData: { gigId: number; offerPrice: number; message: string }) => {
    console.log("Offer submitted:", offerData);
    toast({
      title: "Offer Submitted",
      description: `Your offer of ₹${offerData.offerPrice} has been sent to the gig poster.`,
    });
  };

  const handlePostGig = (gigData: any) => {
    console.log("New gig posted:", gigData);
    toast({
      title: "Gig Posted Successfully!",
      description: `Your gig "${gigData.gigName}" has been posted.`,
    });
  };

  const handleLogin = () => {
    // This will be handled by the Header component now
    console.log("Login clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={handleLogin} />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "trade" && (
          <div className="mt-4 sm:mt-6">
            <GigFeed
              gigs={mockGigs}
              onMakeOffer={handleMakeOffer}
              onPostGig={handlePostGig}
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
  );
};

export default Index;

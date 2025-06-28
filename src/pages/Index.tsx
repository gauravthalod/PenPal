
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import NavigationTabs from "@/components/NavigationTabs";
import GigFeed from "@/components/GigFeed";
import EmptyState from "@/components/EmptyState";
import { Plus, MessageCircle } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("trade");
  const { toast } = useToast();

  // Mock data for demonstration
  const mockGigs = [
    {
      id: 1,
      title: "Math assignment help",
      description: "Need help with calculus assignment. Will provide all materials.",
      category: "Academic",
      price: 200,
      deadline: "2 days",
      poster: "anon_47",
      university: "MIT University",
      timePosted: "2h ago"
    },
    {
      id: 2,
      title: "Graphic design for club event",
      description: "Looking for someone to design poster for our college fest",
      category: "Creative",
      price: 500,
      deadline: "5 days",
      poster: "anon_99",
      university: "Stanford University",
      timePosted: "4h ago"
    },
    {
      id: 3,
      title: "Resume Review",
      description: "Need professional review of my resume for internship applications",
      category: "Academic",
      price: 100,
      deadline: "1 day",
      poster: "anon_12",
      university: "Harvard University",
      timePosted: "1h ago"
    }
  ];

  const handleMakeOffer = (gigId: number) => {
    toast({
      title: "Offer Submitted",
      description: "Your offer has been sent to the gig poster.",
    });
  };

  const handlePostGig = () => {
    toast({
      title: "Post Gig",
      description: "Redirecting to post gig form...",
    });
  };

  const handleLogin = () => {
    toast({
      title: "Login",
      description: "Login functionality would be implemented here.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onPostGigClick={handlePostGig} onLoginClick={handleLogin} />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="container mx-auto px-4 py-6">
        {activeTab === "trade" && (
          <GigFeed gigs={mockGigs} onMakeOffer={handleMakeOffer} />
        )}
        
        {activeTab === "buzz" && (
          <EmptyState
            icon={<MessageCircle className="w-8 h-8 text-gray-400" />}
            title="Buzz Feed Coming Soon"
            description="Connect with fellow students and share updates about campus life"
            actionText="Explore Gigs"
            onAction={() => setActiveTab("trade")}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Clock, DollarSign, Calendar, User, Star, MessageSquare, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { gigService, offerService, Gig, Offer } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

// Enhanced interfaces for dashboard data
interface DashboardStats {
  totalEarnings: number;
  completedGigs: number;
  averageRating: number;
  postedGigs: number;
  activeOffers: number;
  receivedOffers: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  // State for real Firebase data
  const [postedGigs, setPostedGigs] = useState<Gig[]>([]);
  const [offersMade, setOffersMade] = useState<Offer[]>([]);
  const [offersReceived, setOffersReceived] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    completedGigs: 0,
    averageRating: 0,
    postedGigs: 0,
    activeOffers: 0,
    receivedOffers: 0
  });

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!userProfile?.uid) {
      console.log("No user profile found, skipping dashboard data fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching dashboard data for user:", userProfile.uid);

      // Fetch user's posted gigs
      console.log("📋 Fetching user's posted gigs...");
      try {
        const userGigs = await gigService.getUserGigs(userProfile.uid);
        console.log("✅ User posted gigs:", userGigs);
        setPostedGigs(userGigs);
      } catch (gigsError) {
        console.error("❌ Error fetching user gigs:", gigsError);
        setPostedGigs([]); // Set empty array on error
      }

      // Fetch offers made by user
      console.log("📤 Fetching offers made by user...");
      try {
        const madeOffers = await offerService.getOffersMade(userProfile.uid);
        console.log("✅ Offers made by user:", madeOffers);
        setOffersMade(madeOffers);
      } catch (offersError) {
        console.error("❌ Error fetching offers made:", offersError);
        setOffersMade([]); // Set empty array on error
      }

      // Fetch offers received by user (for their gigs)
      console.log("📥 Fetching offers received by user...");
      try {
        const receivedOffers = await offerService.getOffersReceived(userProfile.uid);
        console.log("✅ Offers received by user:", receivedOffers);
        setOffersReceived(receivedOffers);
      } catch (receivedError) {
        console.error("❌ Error fetching offers received:", receivedError);
        setOffersReceived([]); // Set empty array on error
      }

      // Calculate stats (use current state values)
      const completedOffers = offersMade.filter(offer => offer.status === 'accepted');
      const totalEarnings = completedOffers.reduce((sum, offer) => sum + offer.proposedBudget, 0);

      const newStats: DashboardStats = {
        totalEarnings,
        completedGigs: completedOffers.length,
        averageRating: 4.5, // TODO: Implement rating system
        postedGigs: postedGigs.length,
        activeOffers: offersMade.filter(offer => offer.status === 'pending').length,
        receivedOffers: offersReceived.length
      };

      setStats(newStats);
      console.log("📊 Dashboard stats calculated:", newStats);
      console.log("🎉 Dashboard data fetch completed successfully!");

    } catch (error) {
      console.error("💥 Critical error fetching dashboard data:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        toast({
          title: "Permission Error",
          description: "You don't have permission to access this data. Please check your Firebase rules.",
          variant: "destructive"
        });
      } else if (error.code === 'unavailable') {
        toast({
          title: "Connection Error",
          description: "Firebase is currently unavailable. Please try again later.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Loading Dashboard",
          description: `Failed to load dashboard data: ${error.message || 'Unknown error'}. Click 'Test Firebase' to diagnose.`,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    fetchDashboardData();
  }, [userProfile?.uid]);

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    if (!userProfile?.uid) {
      console.log("No user profile for testing");
      return;
    }

    try {
      console.log("🧪 Testing Firebase connection...");

      // Test basic Firebase read
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Test reading from gigs collection
      console.log("📋 Testing gigs collection...");
      const gigsRef = collection(db, 'gigs');
      const gigsSnapshot = await getDocs(gigsRef);
      console.log(`✅ Gigs collection accessible. Found ${gigsSnapshot.size} documents`);

      // Test reading from offers collection
      console.log("📤 Testing offers collection...");
      const offersRef = collection(db, 'offers');
      const offersSnapshot = await getDocs(offersRef);
      console.log(`✅ Offers collection accessible. Found ${offersSnapshot.size} documents`);

      // Test reading from users collection
      console.log("👥 Testing users collection...");
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      console.log(`✅ Users collection accessible. Found ${usersSnapshot.size} documents`);

      toast({
        title: "Firebase Test Successful",
        description: `Gigs: ${gigsSnapshot.size}, Offers: ${offersSnapshot.size}, Users: ${usersSnapshot.size}`,
      });

    } catch (error) {
      console.error("❌ Firebase test failed:", error);
      toast({
        title: "Firebase Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "open":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "open":
        return "Open";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getOfferStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  // Show loading state if not authenticated
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Please log in to view your dashboard</h2>
            <Button onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dashboard</h1>

          {/* Debug button - remove in production */}
          <Button
            variant="outline"
            size="sm"
            onClick={testFirebaseConnection}
            className="text-xs ml-auto"
          >
            Test Firebase
          </Button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Total Earnings</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">₹{stats.totalEarnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Completed Gigs</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.completedGigs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Active Offers</p>
                    <p className="text-lg sm:text-xl font-bold text-yellow-600">{stats.activeOffers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Posted Gigs</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-600">{stats.postedGigs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for different sections */}
        <Tabs defaultValue="offers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="offers">Offers Made</TabsTrigger>
            <TabsTrigger value="posted">Gigs Posted</TabsTrigger>
            <TabsTrigger value="received">Offers Received</TabsTrigger>
          </TabsList>

          {/* Offers Made Tab */}
          <TabsContent value="offers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Offers You Made</h2>
              <Badge variant="secondary">{offersMade.length} offers</Badge>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading offers...</span>
              </div>
            ) : offersMade.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers made yet</h3>
                <p className="text-gray-600">Start browsing gigs and make your first offer!</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Browse Gigs
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {offersMade.map((offer) => (
                  <Card key={offer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{offer.gigTitle}</h3>
                            <Badge className={`${getOfferStatusColor(offer.status)} text-white`}>
                              {getOfferStatusText(offer.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{offer.message}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Offered: {offer.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-blue-600">₹{offer.proposedBudget}</div>
                          <div className="text-sm text-gray-500 mt-1">Proposed Budget</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Posted Gigs Tab */}
          <TabsContent value="posted" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gigs You Posted</h2>
              <Badge variant="secondary">{postedGigs.length} posted</Badge>
            </div>
            
{loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading gigs...</span>
              </div>
            ) : postedGigs.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs posted yet</h3>
                <p className="text-gray-600">Post your first gig to get started!</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Post a Gig
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {postedGigs.map((gig) => (
                  <Card key={gig.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{gig.title}</h3>
                            <Badge className={`${getStatusColor(gig.status)} text-white`}>
                              {getStatusText(gig.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{gig.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Posted: {gig.createdAt.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Deadline: {gig.deadline.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {gig.location}
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-600">₹{gig.budget}</div>
                          <Badge variant="outline" className="mt-1">{gig.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Offers Received Tab */}
          <TabsContent value="received" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Offers Received</h2>
              <Badge variant="secondary">{offersReceived.length} offers</Badge>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading offers...</span>
              </div>
            ) : offersReceived.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers received yet</h3>
                <p className="text-gray-600">Post more gigs to receive offers from other students!</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Post a Gig
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {offersReceived.map((offer) => (
                  <Card key={offer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{offer.gigTitle}</h3>
                            <Badge className={`${getOfferStatusColor(offer.status)} text-white`}>
                              {getOfferStatusText(offer.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{offer.message}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              From: {offer.offeredByName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Received: {offer.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-purple-600">₹{offer.proposedBudget}</div>
                          <div className="text-sm text-gray-500 mt-1">Proposed Budget</div>
                          {offer.status === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

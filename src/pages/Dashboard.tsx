import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Clock, DollarSign, Calendar, User, Star, MessageSquare, Loader2, RefreshCw, Edit, Trash2, Check } from "lucide-react";
import Header from "@/components/Header";
import EditGigDialog from "@/components/EditGigDialog";
import DeleteGigDialog from "@/components/DeleteGigDialog";
import EditOfferDialog from "@/components/EditOfferDialog";
import DeleteOfferDialog from "@/components/DeleteOfferDialog";
import { useAuth } from "@/contexts/AuthContext";
import { gigService, offerService, Gig, Offer } from "@/services/database";
import { chatService } from "@/services/chatService";
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
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);

  // State for edit/delete dialogs
  const [editGigDialog, setEditGigDialog] = useState<{ open: boolean; gig: Gig | null }>({
    open: false,
    gig: null
  });
  const [deleteGigDialog, setDeleteGigDialog] = useState<{ open: boolean; gig: Gig | null }>({
    open: false,
    gig: null
  });
  const [editOfferDialog, setEditOfferDialog] = useState<{ open: boolean; offer: Offer | null }>({
    open: false,
    offer: null
  });
  const [deleteOfferDialog, setDeleteOfferDialog] = useState<{ open: boolean; offer: Offer | null }>({
    open: false,
    offer: null
  });
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
      console.log("🔍 User ID for gig fetch:", userProfile.uid);
      console.log("🔍 User profile:", {
        uid: userProfile.uid,
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        college: userProfile.college
      });
      try {
        const userGigs = await gigService.getUserGigs(userProfile.uid);
        console.log("✅ User posted gigs fetched successfully!");
        console.log("📊 Posted gigs breakdown:", {
          total: userGigs.length,
          gigIds: userGigs.map(g => g.id),
          gigTitles: userGigs.map(g => g.title),
          postedByValues: userGigs.map(g => g.postedBy),
          statuses: userGigs.map(g => g.status)
        });

        if (userGigs.length === 0) {
          console.log("ℹ️ No gigs found for user. This could mean:");
          console.log("   - User hasn't posted any gigs yet");
          console.log("   - Database query issue");
          console.log("   - User ID mismatch");
        }

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
        console.log("📊 Offers made breakdown:", {
          total: madeOffers.length,
          pending: madeOffers.filter(o => o.status === 'pending').length,
          accepted: madeOffers.filter(o => o.status === 'accepted').length,
          rejected: madeOffers.filter(o => o.status === 'rejected').length
        });
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
        console.log("📊 Offers received breakdown:", {
          total: receivedOffers.length,
          pending: receivedOffers.filter(o => o.status === 'pending').length,
          accepted: receivedOffers.filter(o => o.status === 'accepted').length,
          rejected: receivedOffers.filter(o => o.status === 'rejected').length
        });
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

  // Handle accepting an offer
  const handleAcceptOffer = async (offer: Offer) => {
    if (!userProfile) return;

    setProcessingOfferId(offer.id);
    try {
      console.log("🔄 Accepting offer:", offer.id);

      // Update offer status
      await offerService.updateOfferStatus(offer.id, 'accepted');

      // Create chat between gig poster and offer maker
      console.log("💬 Creating chat between poster and doer...");
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

      console.log("✅ Chat created successfully:", chat.id);

      // Update local state
      setOffersReceived(prev => prev.map(o =>
        o.id === offer.id ? { ...o, status: 'accepted' } : o
      ));

      toast({
        title: "Offer Accepted!",
        description: `You've accepted ${offer.offeredByName}'s offer. A chat has been created for you to discuss details.`,
      });

      console.log("✅ Offer accepted successfully");
    } catch (error) {
      console.error("❌ Error accepting offer:", error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingOfferId(null);
    }
  };

  // Handle rejecting an offer
  const handleRejectOffer = async (offer: Offer) => {
    setProcessingOfferId(offer.id);
    try {
      console.log("🔄 Rejecting offer:", offer.id);

      // Update offer status
      await offerService.updateOfferStatus(offer.id, 'rejected');

      // Update local state
      setOffersReceived(prev => prev.map(o =>
        o.id === offer.id ? { ...o, status: 'rejected' } : o
      ));

      toast({
        title: "Offer Rejected",
        description: `You've rejected ${offer.offeredByName}'s offer.`,
      });

      console.log("✅ Offer rejected successfully");
    } catch (error) {
      console.error("❌ Error rejecting offer:", error);
      toast({
        title: "Error",
        description: "Failed to reject offer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingOfferId(null);
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    fetchDashboardData();
  }, [userProfile?.uid]);

  // Listen for gig posted events to refresh dashboard immediately
  useEffect(() => {
    const handleGigPosted = (e: CustomEvent) => {
      console.log("🔄 Detected new gig posted via event, refreshing dashboard...");
      console.log("📋 New gig details:", e.detail?.gig);
      fetchDashboardData();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gigPosted' && e.newValue) {
        console.log("🔄 Detected new gig posted via storage, refreshing dashboard...");
        fetchDashboardData();
        // Clear the flag
        localStorage.removeItem('gigPosted');
      }
    };

    // Listen for custom event (same tab)
    window.addEventListener('gigPosted', handleGigPosted as EventListener);
    // Listen for storage changes (different tabs)
    window.addEventListener('storage', handleStorageChange);

    // Also check for the flag on component mount
    if (localStorage.getItem('gigPosted')) {
      console.log("🔄 Found gigPosted flag on mount, refreshing dashboard...");
      fetchDashboardData();
      localStorage.removeItem('gigPosted');
    }

    return () => {
      window.removeEventListener('gigPosted', handleGigPosted as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);



  // Handle edit gig
  const handleEditGig = (gig: Gig) => {
    console.log("✏️ Opening edit dialog for gig:", gig.id);
    setEditGigDialog({ open: true, gig });
  };

  // Handle delete gig
  const handleDeleteGig = (gig: Gig) => {
    console.log("🗑️ Opening delete dialog for gig:", gig.id);
    setDeleteGigDialog({ open: true, gig });
  };

  // Handle gig updated
  const handleGigUpdated = (updatedGig: Gig) => {
    console.log("✅ Gig updated, refreshing dashboard...");
    setPostedGigs(prev => prev.map(gig =>
      gig.id === updatedGig.id ? updatedGig : gig
    ));

    toast({
      title: "Dashboard Updated",
      description: "Your gig changes are now visible.",
    });
  };

  // Handle gig deleted
  const handleGigDeleted = (gigId: string) => {
    console.log("✅ Gig deleted, refreshing dashboard...");
    setPostedGigs(prev => prev.filter(gig => gig.id !== gigId));

    toast({
      title: "Dashboard Updated",
      description: "The deleted gig has been removed from your dashboard.",
    });
  };

  // Handle mark gig as completed
  const handleMarkCompleted = async (gig: Gig) => {
    try {
      console.log("✅ Marking gig as completed:", gig.id);

      await gigService.updateGigStatus(gig.id!, 'completed');

      // Update local state
      setPostedGigs(prev => prev.map(g =>
        g.id === gig.id ? { ...g, status: 'completed' } : g
      ));

      toast({
        title: "Gig Completed!",
        description: `"${gig.title}" has been marked as completed.`,
      });

      console.log("✅ Gig marked as completed successfully");
    } catch (error) {
      console.error("❌ Error marking gig as completed:", error);
      toast({
        title: "Error",
        description: "Failed to mark gig as completed. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle edit offer
  const handleEditOffer = (offer: Offer) => {
    console.log("✏️ Opening edit dialog for offer:", offer.id);
    setEditOfferDialog({ open: true, offer });
  };

  // Handle delete offer
  const handleDeleteOffer = (offer: Offer) => {
    console.log("🗑️ Opening delete dialog for offer:", offer.id);
    setDeleteOfferDialog({ open: true, offer });
  };

  // Handle offer updated
  const handleOfferUpdated = (updatedOffer: Offer) => {
    console.log("✅ Offer updated, refreshing dashboard...");
    setOffersMade(prev => prev.map(offer =>
      offer.id === updatedOffer.id ? updatedOffer : offer
    ));

    toast({
      title: "Dashboard Updated",
      description: "Your offer changes are now visible.",
    });
  };

  // Handle offer deleted
  const handleOfferDeleted = (offerId: string) => {
    console.log("✅ Offer deleted, refreshing dashboard...");
    setOffersMade(prev => prev.filter(offer => offer.id !== offerId));

    toast({
      title: "Dashboard Updated",
      description: "The deleted offer has been removed from your dashboard.",
    });
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

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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

                      {/* Edit and Delete buttons - only for pending offers */}
                      {offer.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOffer(offer)}
                            className="flex items-center gap-2 flex-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOffer(offer)}
                            className="flex items-center gap-2 flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      )}

                      {/* Status message for non-pending offers */}
                      {offer.status !== 'pending' && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-gray-500 text-center">
                            This offer has been {offer.status} and cannot be modified
                          </p>
                        </div>
                      )}
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

                      {/* Action buttons - conditional based on gig status */}
                      {gig.status === 'completed' ? (
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-center gap-2 py-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">
                              Project Completed Successfully
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditGig(gig)}
                            className="flex items-center gap-2 flex-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>

                          {/* Mark as Completed button - only for open/in_progress gigs */}
                          {(gig.status === 'open' || gig.status === 'in_progress') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkCompleted(gig)}
                              className="flex items-center gap-2 flex-1 text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteGig(gig)}
                            className="flex items-center gap-2 flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      )}
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleAcceptOffer(offer)}
                                disabled={processingOfferId === offer.id}
                              >
                                {processingOfferId === offer.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : null}
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRejectOffer(offer)}
                                disabled={processingOfferId === offer.id}
                              >
                                {processingOfferId === offer.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : null}
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

      {/* Edit Gig Dialog */}
      <EditGigDialog
        gig={editGigDialog.gig}
        open={editGigDialog.open}
        onOpenChange={(open) => setEditGigDialog({ open, gig: open ? editGigDialog.gig : null })}
        onGigUpdated={handleGigUpdated}
      />

      {/* Delete Gig Dialog */}
      <DeleteGigDialog
        gig={deleteGigDialog.gig}
        open={deleteGigDialog.open}
        onOpenChange={(open) => setDeleteGigDialog({ open, gig: open ? deleteGigDialog.gig : null })}
        onGigDeleted={handleGigDeleted}
      />

      {/* Edit Offer Dialog */}
      <EditOfferDialog
        offer={editOfferDialog.offer}
        open={editOfferDialog.open}
        onOpenChange={(open) => setEditOfferDialog({ open, offer: open ? editOfferDialog.offer : null })}
        onOfferUpdated={handleOfferUpdated}
      />

      {/* Delete Offer Dialog */}
      <DeleteOfferDialog
        offer={deleteOfferDialog.offer}
        open={deleteOfferDialog.open}
        onOpenChange={(open) => setDeleteOfferDialog({ open, offer: open ? deleteOfferDialog.offer : null })}
        onOfferDeleted={handleOfferDeleted}
      />
    </div>
  );
};

export default Dashboard;

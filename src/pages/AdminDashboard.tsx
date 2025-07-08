import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Users,
  AlertTriangle,
  Ban,
  Eye,
  Search,
  Filter,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Loader2,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminService, Gig } from "@/services/database";
import { UserProfile } from "@/contexts/AuthContext";
import { testAdminFunctionality } from "@/utils/testAdmin";

interface AdminUser extends UserProfile {
  id: string;
  gigCount?: number;
  offerCount?: number;
  status?: "active" | "banned" | "suspended";
}

interface Report {
  id: string;
  reportedUser: string;
  reportedBy: string;
  reason: string;
  description: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
  severity: "low" | "medium" | "high";
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [gigsLoading, setGigsLoading] = useState(false);

  // Fetch users from Firebase
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log("Admin: Fetching users from Firebase...");
      const fetchedUsers = await adminService.getAllUsers();

      // Enhance users with additional stats
      console.log("Admin: Getting stats for each user...");
      const enhancedUsers = await Promise.all(
        fetchedUsers.map(async (user) => {
          try {
            console.log(`Admin: Getting stats for user ${user.firstName} ${user.lastName} (${user.id})...`);
            const stats = await adminService.getUserStats(user.id);
            console.log(`Admin: Stats for ${user.firstName} ${user.lastName}:`, stats);
            return {
              ...user,
              gigCount: stats.totalGigs,
              offerCount: stats.totalOffers,
              status: "active" as const // Default status, can be enhanced later
            };
          } catch (error) {
            console.warn(`Failed to get stats for user ${user.id} (${user.firstName} ${user.lastName}):`, error);
            return {
              ...user,
              gigCount: 0,
              offerCount: 0,
              status: "active" as const
            };
          }
        })
      );

      setUsers(enhancedUsers);
      console.log(`Admin: Loaded ${enhancedUsers.length} users`);
    } catch (error) {
      console.error("Admin: Error fetching users:", error);
      toast({
        title: "Error Loading Users",
        description: "Failed to load user data from Firebase",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch gigs from Firebase
  const fetchGigs = async () => {
    try {
      setGigsLoading(true);
      console.log("Admin: Fetching gigs from Firebase...");
      const fetchedGigs = await adminService.getAllGigs();
      setGigs(fetchedGigs);
      console.log(`Admin: Loaded ${fetchedGigs.length} gigs`);
    } catch (error) {
      console.error("Admin: Error fetching gigs:", error);
      toast({
        title: "Error Loading Gigs",
        description: "Failed to load gig data from Firebase",
        variant: "destructive"
      });
    } finally {
      setGigsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchGigs()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Mock reports data (can be enhanced later with real reporting system)
  const [reports, setReports] = useState<Report[]>([]);

  // Delete user and all associated data
  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`Are you sure you want to permanently delete ${user.firstName} ${user.lastName} and ALL their data? This action cannot be undone.`)) {
      return;
    }

    try {
      setUsersLoading(true);
      console.log(`Admin: Deleting user ${userId}...`);

      const result = await adminService.deleteUser(userId);

      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));

      // Refresh gigs list to remove deleted user's gigs
      await fetchGigs();

      toast({
        title: "User Deleted Successfully",
        description: `Deleted user and ${result.deletedGigs} gigs, ${result.deletedOffers} offers, ${result.deletedChats} chats`,
        variant: "destructive"
      });
    } catch (error) {
      console.error("Admin: Error deleting user:", error);
      toast({
        title: "Error Deleting User",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Delete gig
  const handleDeleteGig = async (gigId: string) => {
    const gig = gigs.find(g => g.id === gigId);
    if (!gig) return;

    if (!confirm(`Are you sure you want to permanently delete the gig "${gig.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setGigsLoading(true);
      console.log(`Admin: Deleting gig ${gigId}...`);

      const result = await adminService.deleteGig(gigId);

      // Remove gig from local state
      setGigs(gigs.filter(g => g.id !== gigId));

      toast({
        title: "Gig Deleted Successfully",
        description: `Deleted gig and ${result.deletedOffers} offers, ${result.deletedChats} chats`,
        variant: "destructive"
      });
    } catch (error) {
      console.error("Admin: Error deleting gig:", error);
      toast({
        title: "Error Deleting Gig",
        description: "Failed to delete gig. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGigsLoading(false);
    }
  };

  // Refresh data
  const handleRefreshData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchGigs()]);
    setLoading(false);

    toast({
      title: "Data Refreshed",
      description: "All data has been reloaded from Firebase"
    });
  };

  // Test admin functionality
  const handleTestAdmin = async () => {
    try {
      const result = await testAdminFunctionality();
      if (result.success) {
        toast({
          title: "Admin Test Successful",
          description: `Found ${result.usersCount} users and ${result.gigsCount} gigs`
        });
      } else {
        toast({
          title: "Admin Test Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to run admin tests",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "suspended": return "bg-yellow-500";
      case "banned": return "bg-red-500";
      case "open": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.firstName + " " + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.college.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredGigs = gigs.filter(gig => {
    return gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           gig.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           gig.postedByName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pendingReports = reports.filter(report => report.status === "pending");
  const activeUsers = users.filter(user => user.status === "active").length;
  const totalGigs = gigs.length;
  const activeGigs = gigs.filter(gig => gig.status === "open").length;
  const completedGigs = gigs.filter(gig => gig.status === "completed").length;
  const suspendedUsers = users.filter(user => user.status === "suspended").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="text-white border-white hover:bg-red-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Admin
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-red-100">CampusCrew Administration Panel</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-red-800 text-white">
            Super Admin
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-bold text-green-600">{loading ? "..." : users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gigs</p>
                  <p className="text-xl font-bold text-blue-600">{loading ? "..." : totalGigs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Gigs</p>
                  <p className="text-xl font-bold text-yellow-600">{loading ? "..." : activeGigs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Gigs</p>
                  <p className="text-xl font-bold text-green-600">{loading ? "..." : completedGigs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium text-purple-600">
                    {loading ? "Loading..." : "Just now"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Administration Panel</h2>
          <div className="flex gap-2">
            <Button
              onClick={handleTestAdmin}
              variant="outline"
              disabled={loading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Test Admin
            </Button>
            <Button
              onClick={handleRefreshData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="gigs">Gigs Management</TabsTrigger>
            <TabsTrigger value="reports">Reports & Moderation</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            {usersLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search terms" : "No users have been registered yet"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge className={`${getStatusColor(user.status || 'active')} text-white`}>
                              {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Email:</span> {user.email}
                            </div>
                            <div>
                              <span className="font-medium">College:</span> {user.college}
                            </div>
                            <div>
                              <span className="font-medium">Branch:</span> {user.branch}
                            </div>
                            <div>
                              <span className="font-medium">Year:</span> {user.year}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span> {user.phone}
                            </div>
                            <div>
                              <span className="font-medium">Gigs Posted:</span> {user.gigCount || 0}
                            </div>
                            <div>
                              <span className="font-medium">Offers Made:</span> {user.offerCount || 0}
                            </div>
                            <div>
                              <span className="font-medium">Auth Method:</span> {user.authMethod}
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Joined: {user.createdAt.toLocaleDateString()} •
                            Last Updated: {user.updatedAt.toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={usersLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete User
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gigs Tab */}
          <TabsContent value="gigs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gigs Management</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search gigs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {gigsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading gigs...</span>
              </div>
            ) : filteredGigs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search terms" : "No gigs have been posted yet"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredGigs.map((gig) => (
                  <Card key={gig.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{gig.title}</h3>
                            <Badge className={`${getStatusColor(gig.status)} text-white`}>
                              {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {gig.category}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-3" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>{gig.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Budget:</span> ₹{gig.budget}
                            </div>
                            <div>
                              <span className="font-medium">Posted by:</span> {gig.postedByName}
                            </div>
                            <div>
                              <span className="font-medium">College:</span> {gig.college}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> {gig.location}
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Posted: {gig.createdAt.toLocaleDateString()} •
                            Deadline: {gig.deadline.toLocaleDateString()} •
                            Updated: {gig.updatedAt.toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteGig(gig.id!)}
                            disabled={gigsLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Gig
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reports & Moderation</h2>
              <Badge variant="secondary">{pendingReports.length} pending</Badge>
            </div>

            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">Report against @{report.reportedUser}</h3>
                          <Badge className={`${getStatusColor(report.status)} text-white`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </Badge>
                          <Badge className={`${getSeverityColor(report.severity)} text-white`}>
                            {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <p className="font-medium text-gray-700">Reason: {report.reason}</p>
                          <p className="text-gray-600 mt-1">{report.description}</p>
                        </div>

                        <div className="text-sm text-gray-500">
                          Reported by: @{report.reportedBy} • {new Date(report.date).toLocaleDateString()}
                        </div>
                      </div>

                      {report.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleResolveReport(report.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDismissReport(report.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

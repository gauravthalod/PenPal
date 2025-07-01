import { useState } from "react";
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
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  college: string;
  joinDate: string;
  status: "active" | "banned" | "suspended";
  reportCount: number;
  gigCount: number;
  rating: number;
  lastActive: string;
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

  // Mock user data
  const [users, setUsers] = useState<User[]>([
    {
      id: "user_001",
      username: "anon_47",
      email: "student1@cmrec.ac.in",
      college: "CMREC",
      joinDate: "2024-01-10",
      status: "active",
      reportCount: 0,
      gigCount: 5,
      rating: 4.8,
      lastActive: "2024-01-20"
    },
    {
      id: "user_002", 
      username: "anon_99",
      email: "student2@cmrit.ac.in",
      college: "CMRIT",
      joinDate: "2024-01-12",
      status: "active",
      reportCount: 1,
      gigCount: 3,
      rating: 4.2,
      lastActive: "2024-01-19"
    },
    {
      id: "user_003",
      username: "spam_user",
      email: "spammer@cmrec.ac.in", 
      college: "CMREC",
      joinDate: "2024-01-15",
      status: "suspended",
      reportCount: 5,
      gigCount: 0,
      rating: 2.1,
      lastActive: "2024-01-18"
    },
    {
      id: "user_004",
      username: "anon_12",
      email: "student3@cmrtc.ac.in",
      college: "CMRTC", 
      joinDate: "2024-01-08",
      status: "active",
      reportCount: 0,
      gigCount: 8,
      rating: 4.9,
      lastActive: "2024-01-20"
    },
    {
      id: "user_005",
      username: "banned_user",
      email: "violator@cmrcet.ac.in",
      college: "CMRCET",
      joinDate: "2024-01-05",
      status: "banned",
      reportCount: 12,
      gigCount: 2,
      rating: 1.5,
      lastActive: "2024-01-16"
    }
  ]);

  // Mock reports data
  const [reports, setReports] = useState<Report[]>([
    {
      id: "report_001",
      reportedUser: "spam_user",
      reportedBy: "anon_47",
      reason: "Spam/Inappropriate Content",
      description: "User is posting irrelevant content in group chat and sending spam messages",
      date: "2024-01-19",
      status: "pending",
      severity: "high"
    },
    {
      id: "report_002",
      reportedUser: "anon_99", 
      reportedBy: "anon_12",
      reason: "Payment Issues",
      description: "User didn't pay for completed gig work",
      date: "2024-01-18",
      status: "pending",
      severity: "medium"
    },
    {
      id: "report_003",
      reportedUser: "banned_user",
      reportedBy: "anon_47",
      reason: "Harassment",
      description: "User sent inappropriate messages and was harassing other students",
      date: "2024-01-16",
      status: "resolved",
      severity: "high"
    }
  ]);

  const handleBanUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: "banned" as const }
        : user
    ));
    
    toast({
      title: "User Banned",
      description: "User has been banned from the platform",
      variant: "destructive"
    });
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: "suspended" as const }
        : user
    ));
    
    toast({
      title: "User Suspended", 
      description: "User has been temporarily suspended",
    });
  };

  const handleUnbanUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: "active" as const }
        : user
    ));
    
    toast({
      title: "User Unbanned",
      description: "User has been restored to active status",
    });
  };

  const handleResolveReport = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: "resolved" as const }
        : report
    ));
    
    toast({
      title: "Report Resolved",
      description: "Report has been marked as resolved",
    });
  };

  const handleDismissReport = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: "dismissed" as const }
        : report
    ));
    
    toast({
      title: "Report Dismissed",
      description: "Report has been dismissed",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "suspended": return "bg-yellow-500";
      case "banned": return "bg-red-500";
      case "pending": return "bg-orange-500";
      case "resolved": return "bg-green-500";
      case "dismissed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingReports = reports.filter(report => report.status === "pending");
  const activeUsers = users.filter(user => user.status === "active").length;
  const bannedUsers = users.filter(user => user.status === "banned").length;
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-xl font-bold text-green-600">{activeUsers}</p>
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
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-xl font-bold text-yellow-600">{suspendedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Banned Users</p>
                  <p className="text-xl font-bold text-red-600">{bannedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Reports</p>
                  <p className="text-xl font-bold text-orange-600">{pendingReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
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

            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">@{user.username}</h3>
                          <Badge className={`${getStatusColor(user.status)} text-white`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                          {user.reportCount > 0 && (
                            <Badge variant="destructive">
                              {user.reportCount} reports
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Email:</span> {user.email}
                          </div>
                          <div>
                            <span className="font-medium">College:</span> {user.college}
                          </div>
                          <div>
                            <span className="font-medium">Gigs:</span> {user.gigCount}
                          </div>
                          <div>
                            <span className="font-medium">Rating:</span> {user.rating}/5
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Joined: {new Date(user.joinDate).toLocaleDateString()} • 
                          Last Active: {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {user.status === "active" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspendUser(user.id)}
                              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Suspend
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(user.id)}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Ban
                            </Button>
                          </>
                        )}
                        
                        {(user.status === "suspended" || user.status === "banned") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnbanUser(user.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

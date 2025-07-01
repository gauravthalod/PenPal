import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Clock, DollarSign, Calendar, User, Star, MessageSquare } from "lucide-react";
import Header from "@/components/Header";

interface CompletedGig {
  id: string;
  title: string;
  description: string;
  category: string;
  completedPrice: number;
  originalPrice: number;
  clientUsername: string;
  clientCollege: string;
  completedDate: string;
  rating: number;
  review?: string;
  status: "completed" | "paid";
}

interface PostedGig {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deadline: string;
  postedDate: string;
  status: "active" | "in_progress" | "completed" | "cancelled";
  applicantCount: number;
  selectedFreelancer?: {
    username: string;
    college: string;
    agreedPrice: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data for completed gigs (gigs you did for others)
  const [completedGigs] = useState<CompletedGig[]>([
    {
      id: "comp_1",
      title: "Math assignment help",
      description: "Helped with calculus derivatives and integrals",
      category: "Academic",
      completedPrice: 180,
      originalPrice: 200,
      clientUsername: "anon_47",
      clientCollege: "CMREC",
      completedDate: "2024-01-15",
      rating: 5,
      review: "Excellent work! Very detailed explanations and delivered on time.",
      status: "paid"
    },
    {
      id: "comp_2", 
      title: "Resume design",
      description: "Created professional resume with modern design",
      category: "Creative",
      completedPrice: 150,
      originalPrice: 150,
      clientUsername: "anon_99",
      clientCollege: "CMRIT",
      completedDate: "2024-01-12",
      rating: 4,
      review: "Great design, very professional looking!",
      status: "paid"
    },
    {
      id: "comp_3",
      title: "Python script development",
      description: "Built data analysis script for research project",
      category: "Tech",
      completedPrice: 400,
      originalPrice: 450,
      clientUsername: "anon_12",
      clientCollege: "CMRTC",
      completedDate: "2024-01-10",
      rating: 5,
      review: "Perfect solution! Code was clean and well-documented.",
      status: "completed"
    }
  ]);

  // Mock data for posted gigs (gigs you posted)
  const [postedGigs] = useState<PostedGig[]>([
    {
      id: "post_1",
      title: "Website development",
      description: "Need a portfolio website with modern design",
      category: "Tech",
      price: 800,
      deadline: "2024-02-01",
      postedDate: "2024-01-18",
      status: "in_progress",
      applicantCount: 5,
      selectedFreelancer: {
        username: "webdev_pro",
        college: "CMREC",
        agreedPrice: 750
      }
    },
    {
      id: "post_2",
      title: "Research paper writing",
      description: "Need help with literature review for thesis",
      category: "Academic", 
      price: 300,
      deadline: "2024-01-25",
      postedDate: "2024-01-16",
      status: "active",
      applicantCount: 3
    },
    {
      id: "post_3",
      title: "Logo design",
      description: "Created logo for student startup",
      category: "Creative",
      price: 250,
      deadline: "2024-01-20",
      postedDate: "2024-01-14",
      status: "completed",
      applicantCount: 8,
      selectedFreelancer: {
        username: "design_guru",
        college: "CMRIT",
        agreedPrice: 220
      }
    }
  ]);

  const handleBack = () => {
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "active":
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
      case "paid":
        return "Paid";
      case "in_progress":
        return "In Progress";
      case "active":
        return "Active";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const totalEarnings = completedGigs.reduce((sum, gig) => sum + gig.completedPrice, 0);
  const averageRating = completedGigs.reduce((sum, gig) => sum + gig.rating, 0) / completedGigs.length;

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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Total Earnings</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">₹{totalEarnings}</p>
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
                  <p className="text-lg sm:text-xl font-bold text-blue-600">{completedGigs.length}</p>
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
                  <p className="text-xs sm:text-sm text-gray-600">Average Rating</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
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
                  <p className="text-lg sm:text-xl font-bold text-purple-600">{postedGigs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="completed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="completed">Gigs I Completed</TabsTrigger>
            <TabsTrigger value="posted">Gigs I Posted</TabsTrigger>
          </TabsList>

          {/* Completed Gigs Tab */}
          <TabsContent value="completed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gigs You Completed for Others</h2>
              <Badge variant="secondary">{completedGigs.length} completed</Badge>
            </div>
            
            <div className="grid gap-4">
              {completedGigs.map((gig) => (
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
                            <User className="w-4 h-4" />
                            @{gig.clientUsername} • {gig.clientCollege}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Completed: {new Date(gig.completedDate).toLocaleDateString()}
                          </span>
                        </div>

                        {gig.review && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < gig.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{gig.rating}/5</span>
                            </div>
                            <p className="text-sm text-gray-600 italic">"{gig.review}"</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600">₹{gig.completedPrice}</div>
                        {gig.completedPrice !== gig.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">₹{gig.originalPrice}</div>
                        )}
                        <Badge variant="outline" className="mt-1">{gig.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Posted Gigs Tab */}
          <TabsContent value="posted" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gigs You Posted</h2>
              <Badge variant="secondary">{postedGigs.length} posted</Badge>
            </div>
            
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
                            Posted: {new Date(gig.postedDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {gig.applicantCount} applicants
                          </span>
                          {gig.status !== "completed" && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Deadline: {new Date(gig.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {gig.selectedFreelancer && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Selected Freelancer:</p>
                            <p className="text-sm text-blue-600">
                              @{gig.selectedFreelancer.username} • {gig.selectedFreelancer.college} • ₹{gig.selectedFreelancer.agreedPrice}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">₹{gig.price}</div>
                        <Badge variant="outline" className="mt-1">{gig.category}</Badge>
                        {gig.status === "active" && (
                          <Button size="sm" className="mt-2 w-full">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                        )}
                      </div>
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

export default Dashboard;

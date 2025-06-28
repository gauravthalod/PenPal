
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Calendar, User, Book, Home, Message } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");

  // Mock data for demonstration
  const mockGigs = [
    {
      id: 1,
      title: "Help with Math Assignment",
      description: "Need help solving calculus problems for tomorrow's submission",
      category: "Academic",
      price: 150,
      deadline: "2 days",
      poster: "Anonymous_Student_123",
      timePosted: "2 hours ago"
    },
    {
      id: 2,
      title: "Event Photography",
      description: "Looking for someone to cover our college fest with professional camera",
      category: "Creative",
      price: 500,
      deadline: "1 week",
      poster: "Campus_Explorer",
      timePosted: "4 hours ago"
    },
    {
      id: 3,
      title: "Grocery Run",
      description: "Need someone to pick up groceries from nearby market",
      category: "Errands",
      price: 80,
      deadline: "Today",
      poster: "Busy_Senior",
      timePosted: "1 hour ago"
    },
    {
      id: 4,
      title: "Code Review & Debug",
      description: "Python project needs debugging and code review before submission",
      category: "Tech",
      price: 200,
      deadline: "3 days",
      poster: "Code_Ninja",
      timePosted: "6 hours ago"
    }
  ];

  const categories = ["All", "Academic", "Creative", "Tech", "Errands", "Events"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CampusGigs
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Post Gig
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Campus <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Gig Marketplace</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fellow students. Post mini-jobs, accept gigs, and build your campus community.
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="feed" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Gig Feed</span>
            </TabsTrigger>
            <TabsTrigger value="my-gigs" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>My Posted Gigs</span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center space-x-2">
              <Message className="w-4 h-4" />
              <span>Accepted Gigs</span>
            </TabsTrigger>
          </TabsList>

          {/* Gig Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search gigs..."
                  className="pl-10 bg-white/70 backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={category === "All" ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gigs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockGigs.map((gig, index) => (
                <Card key={gig.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        {gig.category}
                      </Badge>
                      <div className="text-2xl font-bold text-green-600">₹{gig.price}</div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {gig.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {gig.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due in {gig.deadline}</span>
                      </div>
                      <span>{gig.timePosted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                            {gig.poster.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{gig.poster}</span>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                        Accept Gig
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Posted Gigs Tab */}
          <TabsContent value="my-gigs" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posted Gigs Yet</h3>
              <p className="text-gray-600 mb-6">Start by posting your first gig to connect with fellow students</p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Gig
              </Button>
            </div>
          </TabsContent>

          {/* Accepted Gigs Tab */}
          <TabsContent value="accepted" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Message className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Accepted Gigs</h3>
              <p className="text-gray-600 mb-6">Browse the gig feed and accept gigs that interest you</p>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("feed")}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Browse Gigs
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 CampusGigs. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

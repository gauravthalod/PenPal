import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Plus } from "lucide-react";
import UserSearchDialog from "./UserSearchDialog";

interface DM {
  id: string;
  username: string;
  college: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface DMListProps {
  selectedDM: string | null;
  onSelectDM: (dmId: string) => void;
}

const DMList = ({ selectedDM, onSelectDM }: DMListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);

  const mockDMs: DM[] = [
    {
      id: "1",
      username: "anon_47",
      college: "CMREC",
      lastMessage: "Thanks for the math help!",
      timestamp: "2m ago",
      unreadCount: 2,
      isOnline: true
    },
    {
      id: "2",
      username: "anon_99",
      college: "CMRIT",
      lastMessage: "When can we discuss the design?",
      timestamp: "1h ago",
      unreadCount: 0,
      isOnline: true
    },
    {
      id: "3",
      username: "anon_12",
      college: "CMRTC",
      lastMessage: "Perfect! The resume looks great",
      timestamp: "3h ago",
      unreadCount: 1,
      isOnline: false
    },
    {
      id: "4",
      username: "anon_88",
      college: "CMRCET",
      lastMessage: "Are you available this weekend?",
      timestamp: "1d ago",
      unreadCount: 0,
      isOnline: false
    },
    {
      id: "5",
      username: "anon_55",
      college: "CMREC",
      lastMessage: "The website mockup is ready",
      timestamp: "2d ago",
      unreadCount: 0,
      isOnline: true
    }
  ];

  const filteredDMs = mockDMs.filter(dm => 
    dm.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dm.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const handleStartDM = (userId: string) => {
    // For now, just select the first DM or create a new one
    // In a real app, this would create a new DM conversation
    onSelectDM(userId);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Direct Messages
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setShowUserSearch(true)}
            title="Add new conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {filteredDMs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredDMs.map((dm) => (
              <div
                key={dm.id}
                onClick={() => onSelectDM(dm.id)}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedDM === dm.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm">
                        {getInitials(dm.username)}
                      </AvatarFallback>
                    </Avatar>
                    {dm.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        @{dm.username}
                      </h4>
                      <div className="flex items-center gap-1">
                        {dm.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center">
                            {dm.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">{dm.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1 truncate">{dm.college}</p>
                    <p className="text-sm text-gray-600 truncate">{dm.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* User Search Dialog */}
      <UserSearchDialog
        open={showUserSearch}
        onOpenChange={setShowUserSearch}
        onStartDM={handleStartDM}
      />
    </Card>
  );
};

export default DMList;

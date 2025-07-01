import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  college: string;
  isOnline: boolean;
  rating: number;
  gigCount: number;
  isAlreadyDM: boolean;
}

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartDM: (userId: string) => void;
}

const UserSearchDialog = ({ open, onOpenChange, onStartDM }: UserSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Mock user data for search
  const mockUsers: User[] = [
    {
      id: "user_001",
      username: "anon_47",
      college: "CMREC",
      isOnline: true,
      rating: 4.8,
      gigCount: 5,
      isAlreadyDM: true
    },
    {
      id: "user_002",
      username: "anon_99", 
      college: "CMRIT",
      isOnline: true,
      rating: 4.2,
      gigCount: 3,
      isAlreadyDM: true
    },
    {
      id: "user_003",
      username: "study_buddy",
      college: "CMREC",
      isOnline: false,
      rating: 4.5,
      gigCount: 7,
      isAlreadyDM: false
    },
    {
      id: "user_004",
      username: "code_master",
      college: "CMRTC",
      isOnline: true,
      rating: 4.9,
      gigCount: 12,
      isAlreadyDM: false
    },
    {
      id: "user_005",
      username: "design_pro",
      college: "CMRIT",
      isOnline: true,
      rating: 4.6,
      gigCount: 8,
      isAlreadyDM: false
    },
    {
      id: "user_006",
      username: "math_helper",
      college: "CMRCET",
      isOnline: false,
      rating: 4.7,
      gigCount: 6,
      isAlreadyDM: false
    },
    {
      id: "user_007",
      username: "event_organizer",
      college: "CMREC",
      isOnline: true,
      rating: 4.4,
      gigCount: 4,
      isAlreadyDM: false
    },
    {
      id: "user_008",
      username: "research_guru",
      college: "CMRTC",
      isOnline: false,
      rating: 4.8,
      gigCount: 9,
      isAlreadyDM: false
    }
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const handleStartDM = (user: User) => {
    if (user.isAlreadyDM) {
      onStartDM(user.id);
      onOpenChange(false);
      toast({
        title: "Opening conversation",
        description: `Switched to chat with @${user.username}`,
      });
    } else {
      onStartDM(user.id);
      onOpenChange(false);
      toast({
        title: "New conversation started",
        description: `Started chatting with @${user.username} from ${user.college}`,
      });
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            Find CMR Students
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by username or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {searchQuery.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Start typing to search for CMR students</p>
                <p className="text-xs text-gray-400 mt-1">Find classmates across CMREC, CMRIT, CMRTC, CMRCET</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No students found</p>
                <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        @{user.username}
                      </h4>
                      {user.isAlreadyDM && (
                        <Badge variant="secondary" className="text-xs">
                          Active DM
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">{user.college}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>⭐ {user.rating}/5</span>
                      <span>•</span>
                      <span>{user.gigCount} gigs</span>
                      <span>•</span>
                      <span className={user.isOnline ? "text-green-500" : "text-gray-400"}>
                        {user.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleStartDM(user)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {user.isAlreadyDM ? "Open" : "Chat"}
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          {searchQuery.length > 0 && filteredUsers.length > 0 && (
            <div className="text-center pt-2 border-t">
              <p className="text-xs text-gray-500">
                Found {filteredUsers.length} student{filteredUsers.length !== 1 ? 's' : ''} • 
                CMR Group of Institutions
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Search, Users, Trash2, MoreVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { chatService, Chat } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

const ChatList = ({ onChatSelect, selectedChatId }: ChatListProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChats = async () => {
    if (!userProfile?.uid) return;
    
    try {
      setLoading(true);
      const userChats = await chatService.getChatsForUser(userProfile.uid);
      setChats(userChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chats. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [userProfile?.uid]);

  const getOtherParticipantName = (chat: Chat) => {
    const otherParticipantIndex = chat.participants.findIndex(id => id !== userProfile?.uid);
    return chat.participantNames[otherParticipantIndex] || "Unknown User";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDeleteChat = async (chatId: string, chatTitle: string) => {
    try {
      console.log("🗑️ Deleting chat:", chatId);

      // Show confirmation
      const confirmed = window.confirm(
        `Are you sure you want to delete the chat for "${chatTitle}"? This action cannot be undone.`
      );

      if (!confirmed) return;

      // Delete the chat
      await chatService.deleteChat(chatId);

      // Remove from local state
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));

      toast({
        title: "Chat Deleted",
        description: `Chat for "${chatTitle}" has been deleted successfully.`,
      });

      console.log("✅ Chat deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatLastMessageTime = (date?: Date) => {
    if (!date) return "";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return "Just now";
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const otherParticipantName = getOtherParticipantName(chat);
    const query = searchQuery.toLowerCase();
    
    return (
      otherParticipantName.toLowerCase().includes(query) ||
      chat.gigTitle.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Gig Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading chats...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Gig Chats
        </CardTitle>
        <p className="text-sm text-gray-600">
          {chats.length} active conversations
        </p>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 px-4">
              {chats.length === 0 ? (
                <>
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
                  <p className="text-gray-500 text-sm">
                    Chats will appear here when your offers are accepted or when you accept offers on your gigs.
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No chats match your search</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => {
                const otherParticipantName = getOtherParticipantName(chat);
                const isSelected = chat.id === selectedChatId;
                
                return (
                  <div
                    key={chat.id}
                    className={`p-4 border-b border-gray-100 transition-colors ${
                      isSelected ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        className="w-12 h-12 flex-shrink-0 cursor-pointer"
                        onClick={() => onChatSelect(chat)}
                      >
                        <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                          {getInitials(otherParticipantName)}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onChatSelect(chat)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {otherParticipantName}
                          </h4>
                          {chat.lastMessageTime && (
                            <span className="text-xs text-gray-500">
                              {formatLastMessageTime(chat.lastMessageTime)}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2 truncate">
                          Gig: {chat.gigTitle}
                        </p>

                        {chat.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>

                      {/* Chat Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id!, chat.gigTitle);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatList;

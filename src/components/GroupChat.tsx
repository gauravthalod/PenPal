import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Image, Video, Smile, Paperclip, Users, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  username: string;
  college: string;
  content: string;
  type: "text" | "image" | "video";
  timestamp: string;
  isCurrentUser: boolean;
}

interface GroupChatProps {
  onShowDMList?: () => void;
}

const GroupChat = ({ onShowDMList }: GroupChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      username: "anon_47",
      college: "CMREC",
      content: "Hey everyone! Just finished my calculus assignment. Anyone need help with derivatives?",
      type: "text",
      timestamp: "10:30 AM",
      isCurrentUser: false
    },
    {
      id: "2",
      username: "anon_99",
      college: "CMRIT",
      content: "That would be amazing! I'm struggling with chain rule",
      type: "text",
      timestamp: "10:32 AM",
      isCurrentUser: false
    },
    {
      id: "3",
      username: "karthik",
      college: "CMREC",
      content: "I can help too! Here's a great resource I found",
      type: "text",
      timestamp: "10:35 AM",
      isCurrentUser: true
    },
    {
      id: "4",
      username: "anon_12",
      college: "CMRTC",
      content: "Thanks everyone! This community is so helpful 🙏",
      type: "text",
      timestamp: "10:40 AM",
      isCurrentUser: false
    },
    {
      id: "5",
      username: "anon_88",
      college: "CMRCET",
      content: "Anyone going to the virtual career fair next week?",
      type: "text",
      timestamp: "11:15 AM",
      isCurrentUser: false
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        username: "karthik",
        college: "CMREC",
        content: message,
        type: "text",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    // Use consistent blue gradient for all BITS Pilani users
    return "from-blue-400 to-blue-600";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="hidden sm:inline">CMR Group of Institutions</span>
            <span className="sm:hidden">CMR Group</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
              247 online
            </Badge>
          </CardTitle>
          {onShowDMList && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowDMList}
              className="sm:hidden"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Connect with fellow CMR students • Share knowledge • Build community
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.isCurrentUser ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={`bg-gradient-to-r ${getAvatarColor(msg.username)} text-white text-sm`}>
                  {getInitials(msg.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-[70%] ${msg.isCurrentUser ? "text-right" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    @{msg.username}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {msg.college}
                  </Badge>
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                </div>
                
                <div
                  className={`rounded-lg p-3 ${
                    msg.isCurrentUser
                      ? "bg-blue-500 text-white ml-auto"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFileUpload}
                  className="h-8 w-8 p-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFileUpload}
                  className="h-8 w-8 p-0"
                >
                  <Image className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFileUpload}
                  className="h-8 w-8 p-0"
                >
                  <Video className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
              
              <Input
                placeholder="Type a message to CMR Group community..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="resize-none"
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-blue-500 hover:bg-blue-600 h-10 w-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              // Handle file upload
              console.log("File selected:", e.target.files?.[0]);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupChat;

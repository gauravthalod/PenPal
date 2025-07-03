import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, MessageCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { chatService, Chat, Message } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";

interface GigChatProps {
  chat: Chat;
  onBack: () => void;
}

const GigChat = ({ chat, onBack }: GigChatProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the other participant's info
  const otherParticipantIndex = chat.participants.findIndex(id => id !== userProfile?.uid);
  const otherParticipantName = chat.participantNames[otherParticipantIndex] || "Unknown User";
  const otherParticipantId = chat.participants[otherParticipantIndex];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chat.id) return;

    // Subscribe to real-time messages
    const unsubscribe = chatService.subscribeToMessages(chat.id, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    // Mark messages as read when chat opens
    if (userProfile?.uid) {
      chatService.markMessagesAsRead(chat.id, userProfile.uid);
    }

    return () => unsubscribe();
  }, [chat.id, userProfile?.uid]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userProfile || !chat.id) return;

    setSending(true);
    try {
      await chatService.sendMessage({
        chatId: chat.id,
        senderId: userProfile.uid,
        senderName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        content: newMessage.trim(),
        type: 'text'
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const dateKey = message.createdAt.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
              {getInitials(otherParticipantName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg">{otherParticipantName}</CardTitle>
            <p className="text-sm text-gray-600">
              Gig: {chat.gigTitle}
            </p>
          </div>
          
          <Badge variant="outline" className="text-green-600 border-green-600">
            <MessageCircle className="w-3 h-3 mr-1" />
            Active Chat
          </Badge>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading messages...</p>
            </div>
          ) : Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-500">
                This chat was created because your offer was accepted. 
                Discuss the gig details and negotiate if needed.
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
              <div key={dateKey}>
                {/* Date separator */}
                <div className="text-center my-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(new Date(dateKey))}
                  </span>
                </div>
                
                {/* Messages for this date */}
                {dayMessages.map((message) => {
                  const isCurrentUser = message.senderId === userProfile?.uid;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={`text-white text-sm ${
                          isCurrentUser 
                            ? "bg-gradient-to-r from-green-400 to-green-600" 
                            : "bg-gradient-to-r from-blue-400 to-blue-600"
                        }`}>
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                        <div className={`rounded-lg px-3 py-2 ${
                          isCurrentUser 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-100 text-gray-900"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • This chat is for gig: "{chat.gigTitle}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GigChat;

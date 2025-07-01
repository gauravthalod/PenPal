import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Image, Video, Smile, Paperclip, ArrowLeft, MoreVertical, Users } from "lucide-react";

interface DMMessage {
  id: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface DMChatProps {
  dmId: string;
  username: string;
  college: string;
  isOnline: boolean;
  onBack: () => void;
  onBackToGroup: () => void;
}

const DMChat = ({ dmId, username, college, isOnline, onBack, onBackToGroup }: DMChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages for the selected DM
  useEffect(() => {
    const loadMessages = () => {
      // Mock messages based on DM ID
      const mockMessages: { [key: string]: DMMessage[] } = {
        "1": [
          {
            id: "1",
            content: "Hey! I saw your math assignment gig. I'm really struggling with derivatives.",
            timestamp: "2:30 PM",
            isCurrentUser: false
          },
          {
            id: "2", 
            content: "Sure! I'd be happy to help. What specific part are you having trouble with?",
            timestamp: "2:32 PM",
            isCurrentUser: true
          },
          {
            id: "3",
            content: "The chain rule is confusing me. Do you have any good resources?",
            timestamp: "2:35 PM", 
            isCurrentUser: false
          },
          {
            id: "4",
            content: "Absolutely! Let me share a great video that helped me understand it.",
            timestamp: "2:37 PM",
            isCurrentUser: true
          },
          {
            id: "5",
            content: "Thanks for the math help! You're a lifesaver 🙏",
            timestamp: "3:15 PM",
            isCurrentUser: false
          }
        ],
        "2": [
          {
            id: "1",
            content: "Hi! I'm interested in your graphic design gig for the club event.",
            timestamp: "1:20 PM",
            isCurrentUser: true
          },
          {
            id: "2",
            content: "Great! What kind of design are you looking for?",
            timestamp: "1:25 PM", 
            isCurrentUser: false
          },
          {
            id: "3",
            content: "We need a poster for our tech fest. Something modern and eye-catching.",
            timestamp: "1:30 PM",
            isCurrentUser: true
          },
          {
            id: "4",
            content: "Perfect! I have some ideas. When can we discuss the details?",
            timestamp: "1:35 PM",
            isCurrentUser: false
          }
        ],
        "3": [
          {
            id: "1",
            content: "Your resume review service looks exactly what I need!",
            timestamp: "Yesterday",
            isCurrentUser: true
          },
          {
            id: "2",
            content: "I'd love to help! Send me your resume and I'll give you detailed feedback.",
            timestamp: "Yesterday",
            isCurrentUser: false
          },
          {
            id: "3",
            content: "Perfect! The resume looks great now. Thank you so much!",
            timestamp: "Yesterday",
            isCurrentUser: true
          }
        ]
      };

      setMessages(mockMessages[dmId] || []);
    };

    loadMessages();
  }, [dmId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: DMMessage = {
        id: Date.now().toString(),
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage("");

      // Simulate real-time response from other user
      simulateResponse(message);
    }
  };

  const simulateResponse = (userMessage: string) => {
    // Show typing indicator
    setIsTyping(true);

    // Generate contextual response based on user message
    const responses = getContextualResponse(userMessage.toLowerCase());
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Simulate typing delay (1-3 seconds)
    const typingDelay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      setIsTyping(false);

      const responseMessage: DMMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: false
      };

      setMessages(prev => [...prev, responseMessage]);
    }, typingDelay);
  };

  const getContextualResponse = (userMessage: string) => {
    if (userMessage.includes('thanks') || userMessage.includes('thank you')) {
      return [
        "You're welcome! Happy to help 😊",
        "No problem at all!",
        "Glad I could help!",
        "Anytime! Feel free to reach out if you need more help"
      ];
    } else if (userMessage.includes('help') || userMessage.includes('question')) {
      return [
        "Sure! What do you need help with?",
        "I'd be happy to help. What's your question?",
        "Of course! Let me know what you're struggling with",
        "What specific part do you need help with?"
      ];
    } else if (userMessage.includes('when') || userMessage.includes('time')) {
      return [
        "I'm free this evening after 6 PM",
        "How about tomorrow afternoon?",
        "I can meet anytime this weekend",
        "Let me check my schedule and get back to you"
      ];
    } else if (userMessage.includes('price') || userMessage.includes('cost') || userMessage.includes('₹')) {
      return [
        "That sounds fair to me!",
        "The price looks good. When can we start?",
        "Perfect! I accept your offer",
        "That works for me. Should we discuss the details?"
      ];
    } else if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('hey')) {
      return [
        "Hey! How's it going?",
        "Hi there! What's up?",
        "Hello! Good to hear from you",
        "Hey! How can I help you today?"
      ];
    } else {
      return [
        "That sounds great!",
        "I see what you mean",
        "Interesting! Tell me more",
        "Got it! Let me think about that",
        "That makes sense",
        "I agree with you on that"
      ];
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 md:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <CardTitle className="text-lg">@{username}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {college}
              </Badge>
              <span className="text-xs text-gray-500">
                {isOnline ? "Online" : "Offline"}
              </span>
              {isTyping && (
                <span className="text-xs text-blue-500 animate-pulse">
                  typing...
                </span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onBackToGroup}
            className="flex items-center gap-2 h-8"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Group Chat</span>
          </Button>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start a conversation with @{username}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isCurrentUser ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm">
                    {msg.isCurrentUser ? "K" : getInitials(username)}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[70%] ${msg.isCurrentUser ? "text-right" : ""}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      msg.isCurrentUser
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm">
                  {getInitials(username)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 max-w-[70%]">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 w-16">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                placeholder={`Message @${username}...`}
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
              console.log("File selected:", e.target.files?.[0]);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DMChat;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ChatList from "@/components/ChatList";
import GigChat from "@/components/GigChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Chat } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";

const GigChats = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      navigate("/login");
    }
  }, [authLoading, userProfile, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chats...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          

        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {/* Chat List - Left Side */}
          <div className="md:col-span-2">
            <ChatList 
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.id}
            />
          </div>
          
          {/* Chat View - Right Side */}
          <div className="md:col-span-3">
            {selectedChat ? (
              <GigChat 
                chat={selectedChat}
                onBack={handleBackToList}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a chat to start messaging
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to view messages and continue chatting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden h-[calc(100vh-200px)]">
          {selectedChat ? (
            <GigChat 
              chat={selectedChat}
              onBack={handleBackToList}
            />
          ) : (
            <ChatList 
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GigChats;

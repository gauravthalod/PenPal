import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, MessageCircle, Paperclip, Image, Video, FileText, X, Upload, Download } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setShowFileOptions(false);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !userProfile || sending) return;

    console.log("🚀 Starting file upload process in GigChat...");
    console.log("📄 File details:", {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size
    });
    console.log("👤 User details:", {
      uid: userProfile.uid,
      name: `${userProfile.firstName} ${userProfile.lastName}`.trim()
    });
    console.log("💬 Chat details:", {
      chatId: chat.id,
      gigTitle: chat.gigTitle
    });

    setSending(true);
    setUploadProgress(10);

    try {
      // Validate chat ID
      if (!chat.id) {
        throw new Error("Chat ID is missing. Please refresh and try again.");
      }

      setUploadProgress(30);

      console.log("📤 Calling chatService.sendMediaMessage...");
      await chatService.sendMediaMessage(
        chat.id,
        userProfile.uid,
        `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        selectedFile
      );

      setUploadProgress(100);
      console.log("✅ File upload completed successfully!");

      // Clear file selection
      setSelectedFile(null);
      setFilePreview(null);
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "File sent successfully!",
        description: `${selectedFile.name} has been shared in the chat.`,
      });
    } catch (error) {
      console.error("❌ Error in handleFileUpload:", error);

      let errorMessage = "Failed to upload file. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('Firebase Storage is not initialized')) {
          errorMessage = "Storage service is not available. Please check your connection and try again.";
        } else if (error.message.includes('File size must be less than')) {
          errorMessage = error.message;
        } else if (error.message.includes('File type') && error.message.includes('not supported')) {
          errorMessage = error.message;
        } else if (error.message.includes('Video must be 15 seconds')) {
          errorMessage = "Video must be 15 seconds or shorter. Please trim your video and try again.";
        } else if (error.message.includes('permission')) {
          errorMessage = "Permission denied. Please check your account permissions.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
      setUploadProgress(0);
    } finally {
      setSending(false);
    }
  };

  // Cancel file selection
  const handleCancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Test storage connection (for debugging)
  const handleTestStorage = async () => {
    try {
      console.log("🧪 Testing storage connection...");
      const isConnected = await chatService.testStorageConnection();

      toast({
        title: isConnected ? "Storage Connected" : "Storage Failed",
        description: isConnected
          ? "Firebase Storage is working correctly!"
          : "Firebase Storage connection failed. Check console for details.",
        variant: isConnected ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Storage test error:", error);
      toast({
        title: "Storage Test Failed",
        description: "Could not test storage connection. Check console for details.",
        variant: "destructive"
      });
    }
  };

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

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestStorage}
              className="text-xs"
            >
              Test Storage
            </Button>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <MessageCircle className="w-3 h-3 mr-1" />
              Active Chat
            </Badge>
          </div>
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
                          {message.type === 'text' ? (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          ) : message.type === 'image' ? (
                            <div className="space-y-2">
                              <img
                                src={message.mediaUrl}
                                alt={message.mediaName}
                                className="max-w-full h-auto rounded-lg max-h-64 object-cover cursor-pointer"
                                loading="lazy"
                                onClick={() => window.open(message.mediaUrl, '_blank')}
                              />
                              <p className="text-xs opacity-75">{message.mediaName}</p>
                            </div>
                          ) : message.type === 'video' ? (
                            <div className="space-y-2">
                              <video
                                src={message.mediaUrl}
                                controls
                                className="max-w-full h-auto rounded-lg max-h-64"
                                preload="metadata"
                              >
                                Your browser does not support video playback.
                              </video>
                              <div className="flex items-center justify-between text-xs opacity-75">
                                <span>{message.mediaName}</span>
                                {message.videoDuration && (
                                  <span>{Math.round(message.videoDuration)}s</span>
                                )}
                              </div>
                            </div>
                          ) : message.type === 'document' ? (
                            <div className="flex items-center gap-2 p-2 bg-white bg-opacity-10 rounded">
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.mediaName}</p>
                                {message.mediaSize && (
                                  <p className="text-xs opacity-75">{formatFileSize(message.mediaSize)}</p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-white hover:bg-opacity-20"
                                onClick={() => window.open(message.mediaUrl, '_blank')}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : null}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
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

        {/* File Preview */}
        {selectedFile && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <div className="flex-shrink-0">
                {selectedFile.type.startsWith('image/') ? (
                  <div className="relative">
                    <Image className="w-8 h-8 text-blue-500" />
                    {filePreview && (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="absolute inset-0 w-8 h-8 object-cover rounded"
                      />
                    )}
                  </div>
                ) : selectedFile.type.startsWith('video/') ? (
                  <Video className="w-8 h-8 text-green-500" />
                ) : (
                  <FileText className="w-8 h-8 text-orange-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleFileUpload}
                  disabled={sending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelFile}
                  disabled={sending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t p-4">
          {/* File Options */}
          {showFileOptions && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowFileOptions(false);
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Image className="w-5 h-5 text-blue-500" />
                  <span className="text-xs">Photos</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowFileOptions(false);
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Video className="w-5 h-5 text-green-500" />
                  <span className="text-xs">Videos</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowFileOptions(false);
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-xs">Documents</span>
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attachment Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFileOptions(!showFileOptions)}
              disabled={sending}
              className="px-3"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <Input
              placeholder="Post here..."
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
            Press Enter to send • Share photos, videos (15s max), and documents • Chat for: "{chat.gigTitle}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GigChat;

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Users, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Download,
  Play,
  Pause,
  X,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { globalChatService, GlobalMessage } from "@/services/globalChatService";

const GlobalChat = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load initial messages and subscribe to real-time updates
  useEffect(() => {
    if (!userProfile?.uid) return;

    console.log("🔄 Setting up global chat for user:", userProfile.uid);
    
    // Subscribe to real-time messages
    const unsubscribe = globalChatService.subscribeToMessages((newMessages) => {
      setMessages(newMessages);
      setLoading(false);
      
      // Update online count (simulate based on recent activity)
      const recentMessages = newMessages.filter(msg => 
        Date.now() - msg.createdAt.getTime() < 5 * 60 * 1000 // 5 minutes
      );
      const uniqueUsers = new Set(recentMessages.map(msg => msg.senderId));
      setOnlineCount(Math.max(uniqueUsers.size, 1));
    });

    return () => {
      console.log("🔄 Cleaning up global chat subscription");
      unsubscribe();
    };
  }, [userProfile?.uid]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle text message sending
  const handleSendMessage = async () => {
    if (!message.trim() || !userProfile || sending) return;

    setSending(true);
    try {
      await globalChatService.sendTextMessage(
        userProfile.uid,
        `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        message
      );
      
      setMessage("");
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

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size based on type
    const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for images, 5MB for others
    const maxSizeMB = file.type.startsWith('image/') ? '10MB' : '5MB';

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSizeMB}.`,
        variant: "destructive"
      });
      return;
    }

    // Check if file type is supported
    if (!file.type.startsWith('image/')) {
      toast({
        title: "File type not supported",
        description: "Currently only images are supported. Video and document support coming soon!",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Handle file upload and send
  const handleSendFile = async () => {
    if (!selectedFile || !userProfile || sending) return;

    setSending(true);
    setUploadProgress(50); // Show some progress immediately

    try {
      console.log("🚀 Starting file upload:", selectedFile.name);

      await globalChatService.sendMediaMessage(
        userProfile.uid,
        `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        selectedFile
      );

      setUploadProgress(100);

      // Clear file selection
      setSelectedFile(null);
      setFilePreview(null);
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Image sent",
        description: "Your image has been shared successfully.",
      });
    } catch (error) {
      console.error("Error sending file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
      setUploadProgress(0);
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedFile) {
        handleSendFile();
      } else {
        handleSendMessage();
      }
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get avatar color based on user ID
  const getAvatarColor = (userId: string) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600", 
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-indigo-400 to-indigo-600",
      "from-red-400 to-red-600",
      "from-yellow-400 to-yellow-600",
      "from-teal-400 to-teal-600"
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    return globalChatService.formatFileSize(bytes);
  };

  if (!userProfile) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-gray-500">Please log in to join the global chat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="hidden sm:inline">What's happening?</span>
            <span className="sm:hidden">What's happening?</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
              {onlineCount} online
            </Badge>
          </CardTitle>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Connect • Share ideas • Build community
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderId === userProfile.uid;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={`bg-gradient-to-r ${getAvatarColor(msg.senderId)} text-white text-sm`}>
                      {getInitials(msg.senderName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {isCurrentUser ? "You" : msg.senderName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    
                    <div className={`rounded-lg px-3 py-2 ${
                      isCurrentUser 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      {msg.type === 'text' ? (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      ) : msg.type === 'image' ? (
                        <div className="space-y-2">
                          <img 
                            src={msg.mediaUrl} 
                            alt={msg.mediaName}
                            className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                            loading="lazy"
                          />
                          <p className="text-xs opacity-75">{msg.mediaName}</p>
                        </div>
                      ) : msg.type === 'video' ? (
                        <div className="space-y-2">
                          <video 
                            src={msg.mediaUrl}
                            controls
                            className="max-w-full h-auto rounded-lg max-h-64"
                            preload="metadata"
                          >
                            Your browser does not support video playback.
                          </video>
                          <div className="flex items-center justify-between text-xs opacity-75">
                            <span>{msg.mediaName}</span>
                            {msg.videoDuration && (
                              <span>{Math.round(msg.videoDuration)}s</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{msg.mediaName}</p>
                            {msg.mediaSize && (
                              <p className="text-xs opacity-75">{formatFileSize(msg.mediaSize)}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(msg.mediaUrl, '_blank')}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                  ) : selectedFile.type.startsWith('video/') ? (
                    <Video className="w-4 h-4 text-purple-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
                
                {filePreview && (
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded border"
                  />
                )}
                
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="h-10 w-10 p-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <Input
                placeholder={selectedFile ? "Add a caption..." : "Tell us what's up…"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="resize-none"
              />
            </div>
            
            <Button
              onClick={selectedFile ? handleSendFile : handleSendMessage}
              disabled={(!message.trim() && !selectedFile) || sending}
              className="bg-blue-500 hover:bg-blue-600 h-10 w-10 p-0"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalChat;

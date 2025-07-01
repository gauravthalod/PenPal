import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, MessageSquare, DollarSign, Calendar, CheckCircle, X, Check, HandCoins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: "offer" | "message" | "deadline" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  gigTitle?: string;
  offerAmount?: number;
  senderUsername?: string;
  status?: "pending" | "accepted" | "rejected";
  canRespond?: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "offer",
      title: "New Offer Received",
      message: "I can deliver within 24h, have helped many with calculus!",
      time: "2 minutes ago",
      isRead: false,
      gigTitle: "Math assignment help",
      offerAmount: 180,
      senderUsername: "mathwiz",
      status: "pending",
      canRespond: true
    },
    {
      id: 2,
      type: "offer",
      title: "New Offer Received",
      message: "Guaranteed A+, send me the file and I'll get started right away!",
      time: "1 hour ago",
      isRead: false,
      gigTitle: "Math assignment help",
      offerAmount: 200,
      senderUsername: "calcpro",
      status: "pending",
      canRespond: true
    },
    {
      id: 3,
      type: "offer",
      title: "New Offer Received",
      message: "Happy to do it for 150, let me know if you need a sample.",
      time: "2 hours ago",
      isRead: false,
      gigTitle: "Math assignment help",
      offerAmount: 150,
      senderUsername: "anil_s",
      status: "pending",
      canRespond: true
    },
    {
      id: 4,
      type: "message",
      title: "New Message",
      message: "You have a new message regarding your graphic design gig",
      time: "3 hours ago",
      isRead: false,
      gigTitle: "Graphic design for club event",
      senderUsername: "anon_45"
    },
    {
      id: 5,
      type: "deadline",
      title: "Deadline Reminder",
      message: "Your Resume Review gig deadline is approaching (1 day left)",
      time: "6 hours ago",
      isRead: true,
      gigTitle: "Resume Review"
    },
    {
      id: 6,
      type: "offer",
      title: "Offer Accepted",
      message: "Your offer for Website development has been accepted!",
      time: "1 day ago",
      isRead: true,
      gigTitle: "Website development",
      offerAmount: 750
    },
    {
      id: 7,
      type: "system",
      title: "Welcome to CampusConnect",
      message: "Complete your profile to start receiving more gig opportunities",
      time: "2 days ago",
      isRead: true
    }
  ]);

  const handleBack = () => {
    navigate("/");
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const acceptOffer = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, status: "accepted" as const, canRespond: false, isRead: true }
          : notif
      )
    );

    const notification = notifications.find(n => n.id === notificationId);
    toast({
      title: "Offer Accepted",
      description: `You accepted @${notification?.senderUsername}'s offer of ₹${notification?.offerAmount}`,
    });
  };

  const rejectOffer = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, status: "rejected" as const, canRespond: false, isRead: true }
          : notif
      )
    );

    const notification = notifications.find(n => n.id === notificationId);
    toast({
      title: "Offer Rejected",
      description: `You rejected @${notification?.senderUsername}'s offer`,
    });
  };

  const getNotificationIcon = (type: string, status?: string) => {
    switch (type) {
      case "offer":
        if (status === "accepted") return <Check className="w-5 h-5 text-green-500" />;
        if (status === "rejected") return <X className="w-5 h-5 text-red-500" />;
        return <HandCoins className="w-5 h-5 text-green-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "deadline":
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case "system":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.isRead ? "bg-blue-50 border-blue-200" : "bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Additional details for specific notification types */}
                          {notification.type === "offer" && notification.offerAmount && (
                            <div className="mt-3 space-y-3">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-2xl font-bold text-green-600">
                                  ₹{notification.offerAmount}
                                </span>
                                {notification.senderUsername && (
                                  <span className="text-gray-600">
                                    From: @{notification.senderUsername}
                                  </span>
                                )}
                                {notification.status && (
                                  <Badge
                                    className={
                                      notification.status === "accepted"
                                        ? "bg-green-500 text-white"
                                        : notification.status === "rejected"
                                        ? "bg-red-500 text-white"
                                        : "bg-blue-500 text-white"
                                    }
                                  >
                                    {notification.status === "accepted" ? "Accepted" :
                                     notification.status === "rejected" ? "Rejected" : "Pending"}
                                  </Badge>
                                )}
                              </div>

                              {notification.canRespond && notification.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => acceptOffer(notification.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => rejectOffer(notification.id)}
                                    className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {notification.gigTitle && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {notification.gigTitle}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {notification.time}
                          </span>
                          
                          <div className="flex gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

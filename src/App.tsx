import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SplashProvider } from "./contexts/SplashContext";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import OffersReceived from "./pages/OffersReceived";
import GigChats from "./pages/GigChats";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showInitialSplash, setShowInitialSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Show splash screen on initial app load
  useEffect(() => {
    console.log("🚀 App starting, showing initial splash screen...");

    // Simulate app initialization time
    const initTimer = setTimeout(() => {
      setAppReady(true);
    }, 2500);

    return () => clearTimeout(initTimer);
  }, []);

  const handleSplashComplete = () => {
    console.log("✅ Initial splash screen completed");
    setShowInitialSplash(false);
  };

  // Show initial splash screen
  if (showInitialSplash && !appReady) {
    return <SplashScreen onComplete={handleSplashComplete} duration={2500} showProgress={true} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SplashProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/offers-received" element={<OffersReceived />} />
                <Route path="/gig-chats" element={<GigChats />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SplashProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

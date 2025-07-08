
import { Button } from "@/components/ui/button";
import { User, LogIn, BarChart3, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSplash } from "@/contexts/SplashContext";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onLoginClick?: () => void;
  showLoginButton?: boolean;
}

const Header = ({ onLoginClick, showLoginButton = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { triggerSplash } = useSplash();
  const { currentUser, userProfile } = useAuth();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogoClick = () => {
    console.log("🎬 Logo clicked, triggering splash screen...");

    // Only show splash if not already on home page
    if (window.location.pathname !== "/") {
      triggerSplash(2000, false); // 2 seconds, no progress bar

      // Navigate after a short delay to allow splash to start
      setTimeout(() => {
        navigate("/");
      }, 100);
    } else {
      // If already on home page, just show a quick splash
      triggerSplash(1500, false);
    }
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleChatsClick = () => {
    navigate("/gig-chats");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">🎓</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-blue-600 hidden xs:block">CampusCrew</h1>
            <h1 className="text-lg font-bold text-blue-600 xs:hidden">CC</h1>
          </button>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleChatsClick}
              className="hover:bg-gray-100 p-1.5 sm:p-2 rounded-full transition-colors"
              title="Gig Chats"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>

            <button
              onClick={handleDashboardClick}
              className="hover:bg-gray-100 p-1.5 sm:p-2 rounded-full transition-colors hidden sm:block"
              title="Dashboard"
            >
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>

            {showLoginButton || !currentUser ? (
              <Button
                onClick={handleLoginClick}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base px-3 sm:px-4"
                size="sm"
              >
                <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">In</span>
              </Button>
            ) : (
              <button
                onClick={handleProfileClick}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

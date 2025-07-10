
import { Button } from "@/components/ui/button";
import { Briefcase, Zap, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const tabs = [
    { id: "trade", label: "Trade", icon: Briefcase },
    { id: "buzz", label: "Buzz", icon: Zap }
  ];

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex justify-center gap-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`rounded-full px-3 sm:px-6 py-2 text-sm sm:text-base ${
                activeTab === tab.id
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {tab.label}
            </Button>
          );
        })}

        {/* Dashboard button for mobile - only show if user is logged in */}
        {currentUser && (
          <Button
            variant="outline"
            className="rounded-full px-3 sm:px-6 py-2 text-sm sm:text-base bg-white border-gray-200 text-gray-600 hover:bg-gray-50 sm:hidden"
            onClick={handleDashboardClick}
            title="Dashboard"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Stats
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationTabs;

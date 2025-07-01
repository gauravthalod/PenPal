
import { Button } from "@/components/ui/button";
import { Briefcase, Zap } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  const tabs = [
    { id: "trade", label: "Trade", icon: Briefcase },
    { id: "buzz", label: "Buzz", icon: Zap }
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex justify-center gap-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base ${
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
      </div>
    </div>
  );
};

export default NavigationTabs;

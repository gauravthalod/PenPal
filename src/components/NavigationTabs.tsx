
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  const tabs = [
    { id: "trade", label: "Trade", icon: "💼" },
    { id: "buzz", label: "Buzz", icon: "⚡" }
  ];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`rounded-none border-b-2 ${
                activeTab === tab.id 
                  ? "border-blue-500 bg-blue-50 text-blue-600" 
                  : "border-transparent hover:bg-gray-50"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;

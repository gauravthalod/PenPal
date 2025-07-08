import { useEffect, useState } from "react";
import { useSplash } from "@/contexts/SplashContext";
import SplashScreen from "./SplashScreen";

interface SplashWrapperProps {
  children: React.ReactNode;
  showSplashOnMount?: boolean;
  splashDuration?: number;
  showProgress?: boolean;
}

const SplashWrapper = ({ 
  children, 
  showSplashOnMount = false, 
  splashDuration = 2000,
  showProgress = false 
}: SplashWrapperProps) => {
  const { showSplash, hideSplash } = useSplash();
  const [localShowSplash, setLocalShowSplash] = useState(showSplashOnMount);

  useEffect(() => {
    if (showSplashOnMount) {
      console.log("🎬 SplashWrapper: Showing splash on mount");
      setLocalShowSplash(true);
    }
  }, [showSplashOnMount]);

  const handleSplashComplete = () => {
    console.log("✅ SplashWrapper: Splash completed");
    setLocalShowSplash(false);
    hideSplash();
  };

  // Show splash screen from context or local state
  if (showSplash || localShowSplash) {
    return (
      <SplashScreen 
        onComplete={handleSplashComplete}
        duration={splashDuration}
        showProgress={showProgress}
      />
    );
  }

  return <>{children}</>;
};

export default SplashWrapper;

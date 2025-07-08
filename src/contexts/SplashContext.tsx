import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SplashContextType {
  showSplash: boolean;
  triggerSplash: (duration?: number, showProgress?: boolean) => void;
  hideSplash: () => void;
  splashConfig: {
    duration: number;
    showProgress: boolean;
  };
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

interface SplashProviderProps {
  children: ReactNode;
}

export const SplashProvider: React.FC<SplashProviderProps> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [splashConfig, setSplashConfig] = useState({
    duration: 2500,
    showProgress: true
  });

  const triggerSplash = (duration = 2500, showProgress = true) => {
    console.log("🎬 Triggering splash screen...");
    setSplashConfig({ duration, showProgress });
    setShowSplash(true);
  };

  const hideSplash = () => {
    console.log("🎬 Hiding splash screen...");
    setShowSplash(false);
  };

  const value: SplashContextType = {
    showSplash,
    triggerSplash,
    hideSplash,
    splashConfig
  };

  return (
    <SplashContext.Provider value={value}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = (): SplashContextType => {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
};

export default SplashContext;

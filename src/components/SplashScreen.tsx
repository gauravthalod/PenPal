import { useEffect, useState } from "react";
import PenPalLogo from "./PenPalLogo";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
  showProgress?: boolean;
}

const SplashScreen = ({ onComplete, duration = 2500, showProgress = true }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Progress animation
    if (showProgress) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, duration / 50);

      return () => clearInterval(progressInterval);
    }
  }, [duration, showProgress]);

  useEffect(() => {
    // Auto-complete after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300">
        {/* Fade out */}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-bounce">
          <div className="bg-white rounded-2xl p-6 mx-auto shadow-2xl inline-block">
            <PenPalLogo size="xlarge" />
          </div>
        </div>

        {/* Tagline */}
        <p className="text-blue-100 text-lg md:text-xl mb-8 animate-fade-in">
          Connect. Collaborate. Create.
        </p>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="bg-blue-500/30 rounded-full h-2 mb-4">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-blue-100 text-sm">
              Loading... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Loading Dots */}
        {!showProgress && (
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full animate-spin-slow"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full animate-spin-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border border-white rounded-full animate-spin-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 border border-white rounded-full animate-spin-slow" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-white rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-white rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/6 w-2 h-2 bg-white rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

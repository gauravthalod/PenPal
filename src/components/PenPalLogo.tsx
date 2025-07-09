import React from 'react';

interface PenPalLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  showText?: boolean;
}

const PenPalLogo: React.FC<PenPalLogoProps> = ({ 
  size = 'medium', 
  variant = 'full', 
  className = '',
  showText = true 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      logoText: 'text-lg',
      logoSize: 'text-2xl',
      underlineHeight: 'h-0.5',
      spacing: 'gap-2',
      containerSize: 'w-16 h-8'
    },
    medium: {
      logoText: 'text-xl',
      logoSize: 'text-3xl',
      underlineHeight: 'h-0.5',
      spacing: 'gap-3',
      containerSize: 'w-20 h-10'
    },
    large: {
      logoText: 'text-2xl',
      logoSize: 'text-4xl',
      underlineHeight: 'h-1',
      spacing: 'gap-4',
      containerSize: 'w-24 h-12'
    },
    xlarge: {
      logoText: 'text-3xl',
      logoSize: 'text-5xl',
      underlineHeight: 'h-1',
      spacing: 'gap-4',
      containerSize: 'w-32 h-16'
    }
  };

  const config = sizeConfig[size];

  // Logo icon component
  const LogoIcon = () => (
    <div className={`flex flex-col items-center justify-center ${config.containerSize}`}>
      <div 
        className={`font-black ${config.logoSize} text-blue-600 leading-none tracking-tighter`}
        style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '-0.1em' }}
      >
        PP
      </div>
      <div className={`w-full ${config.underlineHeight} bg-blue-600 rounded-full mt-1`}></div>
    </div>
  );

  // Logo text component
  const LogoText = () => (
    <span className={`font-bold ${config.logoText} text-blue-600`}>
      PenPal
    </span>
  );

  // Render based on variant
  if (variant === 'icon') {
    return (
      <div className={className}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={className}>
        <LogoText />
      </div>
    );
  }

  // Full logo (icon + text)
  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      <LogoIcon />
      {showText && <LogoText />}
    </div>
  );
};

// Favicon component for browser tab
export const PenPalFavicon = () => (
  <div className="w-8 h-8 flex flex-col items-center justify-center bg-blue-600 rounded">
    <div 
      className="text-white font-black text-xs leading-none"
      style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '-0.05em' }}
    >
      PP
    </div>
    <div className="w-6 h-0.5 bg-white rounded-full mt-0.5"></div>
  </div>
);

// App icon component for mobile
export const PenPalAppIcon = () => (
  <div className="w-16 h-16 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
    <div 
      className="text-white font-black text-2xl leading-none"
      style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '-0.1em' }}
    >
      PP
    </div>
    <div className="w-10 h-1 bg-white rounded-full mt-1"></div>
  </div>
);

// Loading logo with animation
export const PenPalLoadingLogo = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="animate-pulse">
      <PenPalLogo size="large" />
    </div>
    <div className="mt-4 w-16 h-1 bg-blue-200 rounded-full overflow-hidden">
      <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export default PenPalLogo;

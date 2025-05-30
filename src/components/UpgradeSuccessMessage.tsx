
import React, { useEffect, useState } from 'react';

interface UpgradeSuccessMessageProps {
  buildingName: string;
  level: number;
  realm: 'fantasy' | 'scifi';
  position: { x: number; y: number };
  onComplete: () => void;
}

export const UpgradeSuccessMessage: React.FC<UpgradeSuccessMessageProps> = ({
  buildingName,
  level,
  realm,
  position,
  onComplete
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Calculate smart positioning - always appear above buildings with adequate spacing
  const tooltipStyle = {
    left: `${Math.max(10, Math.min(position.x, 85))}%`, // Keep within bounds
    top: `${Math.max(15, position.y - 20)}%`, // Always above, with minimum spacing from top
    transform: 'translate(-50%, -100%)', // Center horizontally, position above
    zIndex: 50 // Ensure it appears above other elements
  };

  return (
    <div 
      className={`absolute pointer-events-none transition-all duration-2500 ease-out ${
        mounted ? 'opacity-0 -translate-y-16 scale-110' : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={tooltipStyle}
    >
      <div className={`px-4 py-3 rounded-xl backdrop-blur-xl border-2 shadow-2xl ${
        realm === 'fantasy'
          ? 'bg-purple-600/90 border-purple-400/80 text-purple-100 shadow-purple-500/40'
          : 'bg-cyan-600/90 border-cyan-400/80 text-cyan-100 shadow-cyan-500/40'
      }`}>
        {/* Glassmorphism inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none rounded-xl" />
        
        <span className="text-sm font-bold relative z-10 flex items-center gap-2">
          <span className="animate-bounce">⬆️</span>
          {buildingName} → Level {level}
        </span>
      </div>
    </div>
  );
};

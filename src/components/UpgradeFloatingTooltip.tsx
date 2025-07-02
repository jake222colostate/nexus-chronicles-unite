
import React, { useEffect, useState } from 'react';

interface UpgradeFloatingTooltipProps {
  buildingName: string;
  level: number;
  realm: 'fantasy' | 'scifi' | 'nexus';
  position: { x: number; y: number };
  onComplete: () => void;
}

export const UpgradeFloatingTooltip: React.FC<UpgradeFloatingTooltipProps> = ({
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
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`absolute z-50 pointer-events-none transition-all duration-2000 ${
        mounted ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'
      }`}
      style={{ left: `${position.x}%`, top: `${position.y - 15}%` }}
    >
      <div className={`px-3 py-2 rounded-full backdrop-blur-md text-xs font-bold border ${
        realm === 'fantasy'
          ? 'bg-purple-600/90 text-purple-100 border-purple-400/60'
          : realm === 'scifi'
          ? 'bg-cyan-600/90 text-cyan-100 border-cyan-400/60'
          : 'bg-indigo-600/90 text-indigo-100 border-indigo-400/60'
      }`}>
        ✨ {buildingName} upgraded to Level {level}
      </div>
    </div>
  );
};

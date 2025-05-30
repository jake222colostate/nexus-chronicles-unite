
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
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`absolute pointer-events-none z-30 transition-all duration-2000 ${
        mounted ? 'opacity-0 -translate-y-12 scale-110' : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className={`px-3 py-2 rounded-full backdrop-blur-md border-2 ${
        realm === 'fantasy'
          ? 'bg-purple-600/90 border-purple-400/80 text-purple-100'
          : 'bg-cyan-600/90 border-cyan-400/80 text-cyan-100'
      } shadow-lg`}>
        <span className="text-sm font-bold">
          {buildingName} → Level {level}
        </span>
      </div>
    </div>
  );
};

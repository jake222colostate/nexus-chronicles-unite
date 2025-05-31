
import React from 'react';

interface JourneyProgressBarProps {
  distance: number;
  className?: string;
}

export const JourneyProgressBar: React.FC<JourneyProgressBarProps> = ({
  distance,
  className = ''
}) => {
  const formatDistance = (dist: number): string => {
    if (dist >= 1000) {
      return `${(dist / 1000).toFixed(1)}km`;
    }
    return `${Math.floor(dist)}m`;
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 ${className}`}>
      <div className="bg-black/60 backdrop-blur-lg border-t border-white/20 px-4 py-2">
        <div className="flex items-center justify-between text-white text-sm">
          <span className="font-medium">Journey Progress</span>
          <span className="font-bold text-cyan-400">{formatDistance(distance)}</span>
        </div>
        
        {/* Progress visualization */}
        <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
            style={{ 
              width: `${Math.min((distance % 1000) / 10, 100)}%`,
              minWidth: distance > 0 ? '2px' : '0px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

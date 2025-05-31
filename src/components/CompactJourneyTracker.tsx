
import React, { useEffect, useState } from 'react';

interface CompactJourneyTrackerProps {
  playerPosition: { x: number; y: number; z: number };
  realm: 'fantasy' | 'scifi';
  onJourneyUpdate?: (distance: number) => void;
}

export const CompactJourneyTracker: React.FC<CompactJourneyTrackerProps> = ({
  playerPosition,
  realm,
  onJourneyUpdate
}) => {
  const [journeyDistance, setJourneyDistance] = useState(0);

  useEffect(() => {
    // Only track forward movement (negative Z is forward)
    const distance = Math.max(0, -playerPosition.z);
    const roundedDistance = Math.floor(distance);
    
    if (roundedDistance !== journeyDistance) {
      setJourneyDistance(roundedDistance);
      if (onJourneyUpdate) {
        onJourneyUpdate(roundedDistance);
      }
    }
  }, [playerPosition.z, journeyDistance, onJourneyUpdate]);

  const progressPercent = (journeyDistance % 100) / 100 * 100;

  return (
    <div className="absolute bottom-24 left-4 right-4 z-30 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">
            Journey: {journeyDistance}m
          </span>
          <span className={`text-sm font-medium ${
            realm === 'fantasy' ? 'text-purple-300' : 'text-cyan-300'
          }`}>
            Realm: {realm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              realm === 'fantasy' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

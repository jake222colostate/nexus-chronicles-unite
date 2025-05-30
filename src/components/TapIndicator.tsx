
import React from 'react';

interface TapIndicatorProps {
  realm: 'fantasy' | 'scifi';
  hasBuildings: boolean;
}

export const TapIndicator: React.FC<TapIndicatorProps> = ({ realm, hasBuildings }) => {
  if (hasBuildings) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
      <div className={`text-center p-4 rounded-lg backdrop-blur-md border animate-pulse ${
        realm === 'fantasy'
          ? 'bg-purple-800/60 border-purple-400/60 text-purple-100'
          : 'bg-cyan-800/60 border-cyan-400/60 text-cyan-100'
      }`}>
        <div className="text-lg mb-2">
          {realm === 'fantasy' ? '✨' : '⚡'}
        </div>
        <div className="text-sm font-medium">
          {realm === 'fantasy' ? 'Tap to generate Mana' : 'Tap to generate Energy'}
        </div>
        <div className="text-xs opacity-70 mt-1">
          Start building to unlock automation
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { CircularTapButton } from './CircularTapButton';

interface BottomActionBarProps {
  currentRealm: 'fantasy' | 'scifi';
  onRealmChange: (realm: 'fantasy' | 'scifi') => void;
  onTap: () => void;
  isTransitioning?: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  currentRealm,
  onRealmChange,
  onTap,
  isTransitioning = false
}) => {
  const handleRealmSwitch = (realm: 'fantasy' | 'scifi') => {
    if (realm !== currentRealm && !isTransitioning) {
      onRealmChange(realm);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pb-4">
      {/* Clean 3-button layout: [Fantasy] [✨] [Sci-Fi] */}
      <div className="flex items-center justify-center px-4">
        <div className="flex items-center justify-between w-full max-w-sm">
          {/* Fantasy Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('fantasy')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-lg transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm border-2 flex-shrink-0 ${
              currentRealm === 'fantasy'
                ? 'bg-purple-600/80 hover:bg-purple-700/80 border-purple-400/70 text-purple-100 shadow-lg shadow-purple-500/25 scale-105'
                : 'bg-black/40 border-purple-400/50 text-purple-300 hover:bg-purple-900/30 hover:border-purple-400/70'
            } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          >
            <span className="relative z-10">Fantasy</span>
            {currentRealm === 'fantasy' && (
              <div className="absolute inset-0 bg-purple-400/15 animate-pulse rounded-lg" />
            )}
          </Button>

          {/* Circular Tap Button - Perfect Center */}
          <div className="flex-shrink-0 mx-4">
            <CircularTapButton realm={currentRealm} onTap={onTap} />
          </div>

          {/* Sci-Fi Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('scifi')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-lg transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm border-2 flex-shrink-0 ${
              currentRealm === 'scifi'
                ? 'bg-cyan-600/80 hover:bg-cyan-700/80 border-cyan-400/70 text-cyan-100 shadow-lg shadow-cyan-500/25 scale-105'
                : 'bg-black/40 border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-400/70'
            } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          >
            <span className="relative z-10">Sci-Fi</span>
            {currentRealm === 'scifi' && (
              <div className="absolute inset-0 bg-cyan-400/15 animate-pulse rounded-lg" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

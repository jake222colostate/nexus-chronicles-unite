
import React from 'react';
import { Button } from '@/components/ui/button';

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

  const handleTap = () => {
    onTap();
    // Add visual feedback
    const button = document.getElementById('tap-button');
    if (button) {
      button.style.transform = 'scale(0.9)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pb-4">
      {/* Clean 3-button layout with proper centering */}
      <div className="flex items-center justify-center px-4">
        <div className="flex items-center justify-between w-full max-w-sm">
          {/* Fantasy Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('fantasy')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm border-2 flex-shrink-0 ${
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

          {/* Enhanced Circular Tap Button - Perfect Center */}
          <div className="flex-shrink-0 mx-6">
            <Button 
              id="tap-button"
              onClick={handleTap}
              className={`h-20 w-20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 font-medium text-3xl backdrop-blur-xl border-3 relative overflow-hidden shadow-2xl ${
                currentRealm === 'fantasy'
                  ? 'bg-gradient-to-br from-purple-600/90 to-violet-700/90 hover:from-purple-500/90 hover:to-violet-600/90 border-purple-400/60 text-purple-100'
                  : 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 hover:from-cyan-500/90 hover:to-blue-600/90 border-cyan-400/60 text-cyan-100'
              }`}
              style={{
                boxShadow: `0 0 30px ${currentRealm === 'fantasy' ? 'rgba(168, 85, 247, 0.6)' : 'rgba(34, 211, 238, 0.6)'}, 0 8px 25px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Enhanced glassmorphism inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10 pointer-events-none rounded-full" />
              
              <span className="relative z-10 text-4xl">✨</span>
              
              {/* Gentle pulse animation */}
              <div className={`absolute inset-0 rounded-full animate-pulse opacity-20 ${
                currentRealm === 'fantasy' 
                  ? 'bg-purple-400/30' 
                  : 'bg-cyan-400/30'
              }`} />
            </Button>
          </div>

          {/* Sci-Fi Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('scifi')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm border-2 flex-shrink-0 ${
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

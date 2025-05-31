
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
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 iphone-safe-bottom">
      {/* Single line footer text */}
      <div className="text-center pb-3 px-4">
        <span className="text-white/70 text-sm font-medium">
          Journey: 6m | Realm: {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
        </span>
      </div>

      {/* Centered 3-button layout with responsive spacing */}
      <div className="flex items-center justify-center px-4 pb-4 pt-2">
        <div className="flex items-center justify-center w-full max-w-lg">
          {/* Fantasy Realm Button */}
          <div className="flex-1 flex justify-center">
            <Button
              onClick={() => handleRealmSwitch('fantasy')}
              disabled={isTransitioning}
              className={`h-11 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm border-2 min-w-[75px] ${
                currentRealm === 'fantasy'
                  ? 'bg-purple-600/90 hover:bg-purple-700/90 border-purple-400/70 text-purple-100 scale-105'
                  : 'bg-black/60 border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400/80 hover:text-purple-200'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'fantasy' 
                  ? '0 4px 15px rgba(168, 85, 247, 0.4), 0 2px 8px rgba(0,0,0,0.3)' 
                  : '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <span className="relative z-10">Fantasy</span>
              {currentRealm === 'fantasy' && (
                <div className="absolute inset-0 bg-purple-400/20 animate-pulse rounded-xl" />
              )}
            </Button>
          </div>

          {/* Enhanced Oval Tap Button - center */}
          <div className="flex-1 flex justify-center px-4">
            <Button 
              id="tap-button"
              onClick={handleTap}
              className={`h-16 w-32 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 font-medium text-2xl backdrop-blur-xl border-2 relative overflow-hidden ${
                currentRealm === 'fantasy'
                  ? 'bg-gradient-to-br from-purple-600/95 to-violet-700/95 hover:from-purple-500/95 hover:to-violet-600/95 border-purple-400/70 text-purple-100'
                  : 'bg-gradient-to-br from-cyan-600/95 to-blue-700/95 hover:from-cyan-500/95 hover:to-blue-600/95 border-cyan-400/70 text-cyan-100'
              }`}
              style={{
                boxShadow: `0 0 30px ${currentRealm === 'fantasy' ? 'rgba(168, 85, 247, 0.6)' : 'rgba(34, 211, 238, 0.6)'}, 0 6px 25px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Enhanced glassmorphism inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10 pointer-events-none rounded-full" />
              
              <span className="relative z-10 text-3xl animate-pulse">✨</span>
              
              {/* Enhanced pulse animation */}
              <div className={`absolute inset-0 rounded-full animate-pulse opacity-30 ${
                currentRealm === 'fantasy' 
                  ? 'bg-purple-400/40' 
                  : 'bg-cyan-400/40'
              }`} />
            </Button>
          </div>

          {/* Sci-Fi Realm Button */}
          <div className="flex-1 flex justify-center">
            <Button
              onClick={() => handleRealmSwitch('scifi')}
              disabled={isTransitioning}
              className={`h-11 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm border-2 min-w-[75px] ${
                currentRealm === 'scifi'
                  ? 'bg-cyan-600/90 hover:bg-cyan-700/90 border-cyan-400/70 text-cyan-100 scale-105'
                  : 'bg-black/60 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400/80 hover:text-cyan-200'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'scifi' 
                  ? '0 4px 15px rgba(34, 211, 238, 0.4), 0 2px 8px rgba(0,0,0,0.3)' 
                  : '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <span className="relative z-10">Sci-Fi</span>
              {currentRealm === 'scifi' && (
                <div className="absolute inset-0 bg-cyan-400/20 animate-pulse rounded-xl" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

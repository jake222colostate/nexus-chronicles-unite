
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
      {/* Perfectly centered 3-button layout with consistent spacing */}
      <div className="flex items-center justify-center px-4 pb-6 pt-4">
        <div className="flex items-center justify-center w-full max-w-md gap-6">
          {/* Fantasy Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('fantasy')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden font-medium text-sm border-2 flex-shrink-0 min-w-[80px] ${
              currentRealm === 'fantasy'
                ? 'bg-purple-600/90 hover:bg-purple-700/90 border-purple-400/70 text-purple-100 shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-black/50 border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400/80 hover:text-purple-200'
            } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          >
            <span className="relative z-10">Fantasy</span>
            {currentRealm === 'fantasy' && (
              <div className="absolute inset-0 bg-purple-400/20 animate-pulse rounded-xl" />
            )}
          </Button>

          {/* Enhanced Oval Tap Button - Perfect center with increased vertical padding */}
          <div className="flex-shrink-0">
            <Button 
              id="tap-button"
              onClick={handleTap}
              className={`h-20 w-28 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95 font-medium text-3xl backdrop-blur-xl border-3 relative overflow-hidden ${
                currentRealm === 'fantasy'
                  ? 'bg-gradient-to-br from-purple-600/95 to-violet-700/95 hover:from-purple-500/95 hover:to-violet-600/95 border-purple-400/70 text-purple-100'
                  : 'bg-gradient-to-br from-cyan-600/95 to-blue-700/95 hover:from-cyan-500/95 hover:to-blue-600/95 border-cyan-400/70 text-cyan-100'
              }`}
              style={{
                boxShadow: `0 0 35px ${currentRealm === 'fantasy' ? 'rgba(168, 85, 247, 0.7)' : 'rgba(34, 211, 238, 0.7)'}, 0 8px 30px rgba(0,0,0,0.6)`,
                borderRadius: '2.5rem', // Enhanced oval shape
              }}
            >
              {/* Enhanced glassmorphism inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10 pointer-events-none rounded-full" />
              
              <span className="relative z-10 text-4xl">✨</span>
              
              {/* Enhanced pulse animation */}
              <div className={`absolute inset-0 rounded-full animate-pulse opacity-25 ${
                currentRealm === 'fantasy' 
                  ? 'bg-purple-400/40' 
                  : 'bg-cyan-400/40'
              }`} />
            </Button>
          </div>

          {/* Sci-Fi Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('scifi')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden font-medium text-sm border-2 flex-shrink-0 min-w-[80px] ${
              currentRealm === 'scifi'
                ? 'bg-cyan-600/90 hover:bg-cyan-700/90 border-cyan-400/70 text-cyan-100 shadow-lg shadow-cyan-500/30 scale-105'
                : 'bg-black/50 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400/80 hover:text-cyan-200'
            } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          >
            <span className="relative z-10">Sci-Fi</span>
            {currentRealm === 'scifi' && (
              <div className="absolute inset-0 bg-cyan-400/20 animate-pulse rounded-xl" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';

interface BottomActionBarProps {
  currentRealm: 'fantasy' | 'scifi';
  onRealmChange: (realm: 'fantasy' | 'scifi') => void;
  onTap: () => void;
  isTransitioning?: boolean;
  playerDistance?: number;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  currentRealm,
  onRealmChange,
  onTap,
  isTransitioning = false,
  playerDistance = 0
}) => {
  const handleRealmSwitch = (realm: 'fantasy' | 'scifi') => {
    if (realm !== currentRealm && !isTransitioning) {
      onRealmChange(realm);
    }
  };

  const handleTap = () => {
    onTap();
    // Enhanced visual feedback
    const button = document.getElementById('tap-button');
    if (button) {
      button.style.transform = 'scale(0.92)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 120);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      {/* Journey Progress Bar */}
      <div className="px-4 pb-3">
        <div className="bg-black/70 backdrop-blur-xl rounded-xl p-4 border border-white/25 shadow-lg">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm font-medium">Journey Progress</span>
              <span className="text-white text-sm font-bold">{Math.floor(playerDistance)}m</span>
            </div>
            <div className="w-full bg-gray-700/60 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (playerDistance % 100))}%` }}
              />
            </div>
          </div>
          
          {/* Journey Status */}
          <div className="text-center">
            <span className="text-white/90 text-base font-medium">
              Journey: {Math.floor(playerDistance)}m | Realm: {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Control Bar - Perfectly Centered */}
      <div className="bg-black/90 backdrop-blur-xl border-t border-white/20 py-4">
        <div className="flex items-center justify-center px-6">
          <div className="flex items-center justify-center w-full max-w-lg gap-4">
            {/* Fantasy Realm Button */}
            <Button
              onClick={() => handleRealmSwitch('fantasy')}
              disabled={isTransitioning}
              className={`h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium border-2 flex-shrink-0 ${
                currentRealm === 'fantasy'
                  ? 'bg-purple-600/95 hover:bg-purple-700/95 border-purple-400/80 text-purple-100 scale-105'
                  : 'bg-black/70 border-purple-400/60 text-purple-300 hover:bg-purple-900/50 hover:border-purple-400/80 hover:text-purple-200'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'fantasy' 
                  ? '0 4px 15px rgba(168, 85, 247, 0.5), 0 2px 8px rgba(0,0,0,0.4)' 
                  : '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <span className="relative z-10 text-sm font-bold">Fantasy</span>
              {currentRealm === 'fantasy' && (
                <div className="absolute inset-0 bg-purple-400/25 animate-pulse rounded-xl" />
              )}
            </Button>

            {/* Enhanced Oval Mana Tap Button - Larger and More Prominent */}
            <Button 
              id="tap-button"
              onClick={handleTap}
              className={`h-20 w-40 rounded-full transition-all duration-200 hover:scale-110 active:scale-92 font-bold text-3xl backdrop-blur-xl border-3 relative overflow-hidden shadow-2xl ${
                currentRealm === 'fantasy'
                  ? 'bg-gradient-to-br from-purple-600/95 to-violet-700/95 hover:from-purple-500/95 hover:to-violet-600/95 border-purple-400/80 text-purple-100'
                  : 'bg-gradient-to-br from-cyan-600/95 to-blue-700/95 hover:from-cyan-500/95 hover:to-blue-600/95 border-cyan-400/80 text-cyan-100'
              }`}
              style={{
                boxShadow: `0 0 50px ${currentRealm === 'fantasy' ? 'rgba(168, 85, 247, 0.9)' : 'rgba(34, 211, 238, 0.9)'}, 0 8px 35px rgba(0,0,0,0.6)`,
              }}
            >
              {/* Enhanced glassmorphism inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/15 pointer-events-none rounded-full" />
              
              <span className="relative z-10 drop-shadow-lg">✨</span>
              
              {/* Enhanced pulse animation */}
              <div className={`absolute inset-0 rounded-full animate-pulse opacity-50 ${
                currentRealm === 'fantasy' 
                  ? 'bg-purple-400/60' 
                  : 'bg-cyan-400/60'
              }`} />
              
              {/* Glow ring effect */}
              <div className={`absolute inset-[-2px] rounded-full opacity-75 ${
                currentRealm === 'fantasy' 
                  ? 'bg-purple-500/30' 
                  : 'bg-cyan-500/30'
              } blur-sm`} />
            </Button>

            {/* Sci-Fi Realm Button */}
            <Button
              onClick={() => handleRealmSwitch('scifi')}
              disabled={isTransitioning}
              className={`h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium border-2 flex-shrink-0 ${
                currentRealm === 'scifi'
                  ? 'bg-cyan-600/95 hover:bg-cyan-700/95 border-cyan-400/80 text-cyan-100 scale-105'
                  : 'bg-black/70 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400/80 hover:text-cyan-200'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'scifi' 
                  ? '0 4px 15px rgba(34, 211, 238, 0.5), 0 2px 8px rgba(0,0,0,0.4)' 
                  : '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <span className="relative z-10 text-sm font-bold">Sci-Fi</span>
              {currentRealm === 'scifi' && (
                <div className="absolute inset-0 bg-cyan-400/25 animate-pulse rounded-xl" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

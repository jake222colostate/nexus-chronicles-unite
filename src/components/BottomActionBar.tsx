
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
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto boundary-constrained">
      {/* Journey Progress Bar */}
      <div className="px-4 pb-2">
        <div className="text-center mb-2">
          <span className="text-white/90 text-sm font-medium">
            Journey: {Math.floor(playerDistance)}m | Realm: {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
          </span>
        </div>
        <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (playerDistance % 100))}%` }}
          />
        </div>
      </div>

      {/* Main Control Bar */}
      <div className="bg-black/95 backdrop-blur-xl border-t border-white/20 py-4 pointer-events-auto">
        <div className="flex items-center justify-center px-4">
          <div className="flex items-center justify-center w-full gap-4">
            {/* Fantasy Realm Button */}
            <Button
              onClick={() => handleRealmSwitch('fantasy')}
              disabled={isTransitioning}
              className={`h-12 flex-1 rounded-xl transition-all duration-300 font-bold text-sm pointer-events-auto cursor-pointer ${
                currentRealm === 'fantasy'
                  ? 'bg-purple-600/95 hover:bg-purple-700/95 border-2 border-purple-400/80 text-purple-100'
                  : 'bg-black/70 border-2 border-purple-400/60 text-purple-300 hover:bg-purple-900/50'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'fantasy' 
                  ? '0 4px 20px rgba(168, 85, 247, 0.6)' 
                  : '0 2px 10px rgba(0,0,0,0.3)',
                pointerEvents: 'auto'
              }}
            >
              Fantasy
            </Button>

            {/* Central Tap Button */}
            <Button 
              id="tap-button"
              onClick={handleTap}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600/95 to-violet-700/95 hover:from-purple-500/95 hover:to-violet-600/95 border-3 border-purple-400/80 text-purple-100 transition-all duration-200 hover:scale-110 active:scale-92 font-bold text-2xl backdrop-blur-xl relative overflow-hidden shadow-2xl pointer-events-auto cursor-pointer"
              style={{
                boxShadow: '0 0 40px rgba(168, 85, 247, 0.9), 0 8px 30px rgba(0,0,0,0.6)',
                pointerEvents: 'auto'
              }}
            >
              <span className="relative z-10">✨</span>
            </Button>

            {/* Sci-Fi Realm Button */}
            <Button
              onClick={() => handleRealmSwitch('scifi')}
              disabled={isTransitioning}
              className={`h-12 flex-1 rounded-xl transition-all duration-300 font-bold text-sm pointer-events-auto cursor-pointer ${
                currentRealm === 'scifi'
                  ? 'bg-cyan-600/95 hover:bg-cyan-700/95 border-2 border-cyan-400/80 text-cyan-100'
                  : 'bg-black/70 border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/50'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                boxShadow: currentRealm === 'scifi' 
                  ? '0 4px 20px rgba(34, 211, 238, 0.6)' 
                  : '0 2px 10px rgba(0,0,0,0.3)',
                pointerEvents: 'auto'
              }}
            >
              Sci-Fi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

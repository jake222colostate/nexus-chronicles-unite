
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
      {/* Journey Progress Section */}
      <div className="bg-black/60 backdrop-blur-sm px-3 py-2">
        <div className="text-center mb-2">
          <span className="text-white/90 text-sm font-medium">
            Journey: {Math.floor(playerDistance)}m | Realm: {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
          </span>
        </div>
        <div className="w-full bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (playerDistance % 100))}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-black/90 backdrop-blur-sm border-t border-white/10 py-3 px-3">
        <div className="flex items-center justify-center gap-3">
          {/* Fantasy Button */}
          <Button
            onClick={() => handleRealmSwitch('fantasy')}
            disabled={isTransitioning}
            className={`h-12 flex-1 rounded-xl transition-all duration-300 font-semibold text-sm ${
              currentRealm === 'fantasy'
                ? 'bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 text-white'
                : 'bg-black/70 border-2 border-purple-400/50 text-purple-300 hover:bg-purple-900/30'
            } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          >
            Fantasy
          </Button>

          {/* Central Tap Button */}
          <Button 
            id="tap-button"
            onClick={handleTap}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 border-2 border-purple-400 text-white transition-all duration-200 hover:scale-105 active:scale-95 font-bold text-xl relative overflow-hidden"
            style={{
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
            }}
          >
            <span className="relative z-10">✨</span>
          </Button>

          {/* Sci-Fi Button */}
          <Button
            onClick={() => handleRealmSwitch('scifi')}
            disabled={isTransitioning}
            className={`h-12 flex-1 rounded-xl transition-all duration-300 font-semibold text-sm ${
              currentRealm === 'scifi'
                ? 'bg-cyan-600 hover:bg-cyan-700 border-2 border-cyan-400 text-white'
                : 'bg-black/70 border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/30'
            } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          >
            Sci-Fi
          </Button>
        </div>
      </div>
    </div>
  );
};

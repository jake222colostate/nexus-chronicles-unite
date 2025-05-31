
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
      {/* Journey Progress Bar */}
      <div className="px-4 pb-2">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/70 text-xs">Journey Progress</span>
              <span className="text-white text-xs font-medium">{Math.floor(playerDistance)}m</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (playerDistance % 100))}%` }}
              />
            </div>
          </div>
          
          {/* Journey Status */}
          <div className="text-center">
            <span className="text-white/90 text-sm font-medium">
              Journey: {Math.floor(playerDistance)}m | Realm: {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
            </span>
          </div>
        </div>
      </div>

      {/* Button Layout - Perfectly Centered */}
      <div className="flex items-center justify-center px-4 pb-4">
        <div className="flex items-center justify-center w-full max-w-lg gap-4">
          {/* Fantasy Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('fantasy')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium border-2 ${
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

          {/* Enhanced Oval Tap Button - more prominent */}
          <Button 
            id="tap-button"
            onClick={handleTap}
            className={`h-20 w-36 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 font-medium text-3xl backdrop-blur-xl border-2 relative overflow-hidden ${
              currentRealm === 'fantasy'
                ? 'bg-gradient-to-br from-purple-600/95 to-violet-700/95 hover:from-purple-500/95 hover:to-violet-600/95 border-purple-400/70 text-purple-100'
                : 'bg-gradient-to-br from-cyan-600/95 to-blue-700/95 hover:from-cyan-500/95 hover:to-blue-600/95 border-cyan-400/70 text-cyan-100'
            }`}
            style={{
              boxShadow: `0 0 40px ${currentRealm === 'fantasy' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(34, 211, 238, 0.8)'}, 0 8px 30px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Enhanced glassmorphism inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10 pointer-events-none rounded-full" />
            
            <span className="relative z-10">✨</span>
            
            {/* Enhanced pulse animation */}
            <div className={`absolute inset-0 rounded-full animate-pulse opacity-40 ${
              currentRealm === 'fantasy' 
                ? 'bg-purple-400/50' 
                : 'bg-cyan-400/50'
            }`} />
          </Button>

          {/* Sci-Fi Realm Button */}
          <Button
            onClick={() => handleRealmSwitch('scifi')}
            disabled={isTransitioning}
            className={`h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden font-medium border-2 ${
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
  );
};

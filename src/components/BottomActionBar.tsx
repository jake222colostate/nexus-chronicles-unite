
import React from 'react';
import { Button } from '@/components/ui/button';

interface BottomActionBarProps {
  currentRealm: 'fantasy' | 'scifi';
  onRealmChange: (realm: 'fantasy' | 'scifi') => void;
  isTransitioning?: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  currentRealm,
  onRealmChange,
  isTransitioning = false
}) => {
  const handleRealmSwitch = (realm: 'fantasy' | 'scifi') => {
    if (realm !== currentRealm && !isTransitioning) {
      onRealmChange(realm);
    }
  };

  return (
    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex items-center gap-3 bg-black/50 backdrop-blur-xl p-2 rounded-full border border-white/30 shadow-lg">
        {/* Enhanced glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-full" />
        
        {/* Fantasy Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('fantasy')}
          disabled={isTransitioning}
          className={`h-12 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm ${
            currentRealm === 'fantasy'
              ? 'bg-purple-600/90 hover:bg-purple-700/90 shadow-lg shadow-purple-500/30 scale-105 border border-purple-400/80'
              : 'bg-transparent border border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            🏰 Fantasy
          </span>
          {currentRealm === 'fantasy' && (
            <div className="absolute inset-0 bg-purple-400/20 animate-pulse rounded-full" />
          )}
        </Button>

        {/* Sci-Fi Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('scifi')}
          disabled={isTransitioning}
          className={`h-12 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm ${
            currentRealm === 'scifi'
              ? 'bg-cyan-600/90 hover:bg-cyan-700/90 shadow-lg shadow-cyan-500/30 scale-105 border border-cyan-400/80'
              : 'bg-transparent border border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            🚀 Sci-Fi
          </span>
          {currentRealm === 'scifi' && (
            <div className="absolute inset-0 bg-cyan-400/20 animate-pulse rounded-full" />
          )}
        </Button>
      </div>
    </div>
  );
};

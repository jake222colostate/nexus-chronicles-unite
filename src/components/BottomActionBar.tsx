
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl p-2.5 rounded-full border border-white/40 shadow-xl">
        {/* Enhanced glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/15 pointer-events-none rounded-full" />
        
        {/* Fantasy Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('fantasy')}
          disabled={isTransitioning}
          className={`h-11 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm shadow-lg ${
            currentRealm === 'fantasy'
              ? 'bg-purple-600/90 hover:bg-purple-700/90 shadow-purple-500/40 scale-105 border border-purple-400/80 text-purple-100'
              : 'bg-transparent border border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400 shadow-purple-500/20'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          style={{
            filter: currentRealm === 'fantasy' 
              ? 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.3))' 
              : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))'
          }}
        >
          <span className="relative z-10 flex items-center gap-1.5 drop-shadow-sm">
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
          className={`h-11 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-medium text-sm shadow-lg ${
            currentRealm === 'scifi'
              ? 'bg-cyan-600/90 hover:bg-cyan-700/90 shadow-cyan-500/40 scale-105 border border-cyan-400/80 text-cyan-100'
              : 'bg-transparent border border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 shadow-cyan-500/20'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          style={{
            filter: currentRealm === 'scifi' 
              ? 'drop-shadow(0 4px 12px rgba(34, 211, 238, 0.3))' 
              : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))'
          }}
        >
          <span className="relative z-10 flex items-center gap-1.5 drop-shadow-sm">
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

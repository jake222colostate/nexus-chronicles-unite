
import React from 'react';
import { Button } from '@/components/ui/button';

interface BottomActionBarProps {
  currentRealm: 'fantasy' | 'scifi';
  onRealmChange: (realm: 'fantasy' | 'scifi') => void;
  onHybridClick: () => void;
  isTransitioning?: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  currentRealm,
  onRealmChange,
  onHybridClick,
  isTransitioning = false
}) => {
  const handleRealmSwitch = (realm: 'fantasy' | 'scifi') => {
    if (realm !== currentRealm && !isTransitioning) {
      onRealmChange(realm);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/30">
        {/* Fantasy Realm Button - Enhanced */}
        <Button
          onClick={() => handleRealmSwitch('fantasy')}
          disabled={isTransitioning}
          className={`h-12 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden ${
            currentRealm === 'fantasy'
              ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50 scale-105 border-2 border-purple-400'
              : 'bg-transparent border-2 border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="text-xs font-medium relative z-10">🏰 Fantasy</span>
          {currentRealm === 'fantasy' && (
            <div className="absolute inset-0 bg-purple-400/20 animate-pulse rounded-full" />
          )}
          {/* Tap feedback ripple */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 transition-transform duration-150 active:scale-100" />
        </Button>

        {/* Sci-Fi Realm Button - Enhanced */}
        <Button
          onClick={() => handleRealmSwitch('scifi')}
          disabled={isTransitioning}
          className={`h-12 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden ${
            currentRealm === 'scifi'
              ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/50 scale-105 border-2 border-cyan-400'
              : 'bg-transparent border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="text-xs font-medium relative z-10">🚀 Sci-Fi</span>
          {currentRealm === 'scifi' && (
            <div className="absolute inset-0 bg-cyan-400/20 animate-pulse rounded-full" />
          )}
          {/* Tap feedback ripple */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 transition-transform duration-150 active:scale-100" />
        </Button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/30"></div>

        {/* Hybrid Button - Enhanced */}
        <Button 
          onClick={onHybridClick}
          className="h-12 px-4 rounded-full bg-gradient-to-r from-purple-500/80 to-cyan-500/80 hover:from-purple-600/80 hover:to-cyan-600/80 backdrop-blur-sm border-2 border-transparent hover:border-white/30 transition-all duration-300 relative overflow-hidden active:scale-95"
        >
          <span className="text-xs font-medium relative z-10">✨ Hybrid</span>
          {/* Tap feedback ripple */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 transition-transform duration-150 active:scale-100" />
        </Button>
      </div>
    </div>
  );
};

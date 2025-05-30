
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
      <div className="flex items-center gap-3 bg-black/50 backdrop-blur-xl p-3 rounded-2xl border-2 border-white/30 shadow-2xl">
        {/* Enhanced glassmorphism with consistent styling */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-2xl" />
        <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-inner" style={{
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.25), 0 0 20px rgba(255,255,255,0.1)'
        }} />
        
        {/* Fantasy Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('fantasy')}
          disabled={isTransitioning}
          className={`h-12 px-6 rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-semibold text-sm ${
            currentRealm === 'fantasy'
              ? 'bg-purple-600/90 hover:bg-purple-700/90 shadow-lg shadow-purple-500/50 scale-105 border-2 border-purple-400/80'
              : 'bg-transparent border-2 border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="relative z-10 flex items-center gap-2">
            🏰 <span>Fantasy</span>
          </span>
          {currentRealm === 'fantasy' && (
            <div className="absolute inset-0 bg-purple-400/25 animate-pulse rounded-xl" />
          )}
        </Button>

        {/* Sci-Fi Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('scifi')}
          disabled={isTransitioning}
          className={`h-12 px-6 rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-semibold text-sm ${
            currentRealm === 'scifi'
              ? 'bg-cyan-600/90 hover:bg-cyan-700/90 shadow-lg shadow-cyan-500/50 scale-105 border-2 border-cyan-400/80'
              : 'bg-transparent border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="relative z-10 flex items-center gap-2">
            🚀 <span>Sci-Fi</span>
          </span>
          {currentRealm === 'scifi' && (
            <div className="absolute inset-0 bg-cyan-400/25 animate-pulse rounded-xl" />
          )}
        </Button>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-1"></div>

        {/* Hybrid Button - matching style and spacing */}
        <Button 
          onClick={onHybridClick}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500/80 to-cyan-500/80 hover:from-purple-600/80 hover:to-cyan-600/80 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 transition-all duration-300 relative overflow-hidden active:scale-95 shadow-lg shadow-purple-500/30 font-semibold text-sm"
        >
          <span className="relative z-10 flex items-center gap-2 text-white">
            ✨ <span>Hybrid</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/25 to-cyan-400/25 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </Button>
      </div>
    </div>
  );
};

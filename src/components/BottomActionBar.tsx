
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
    <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center px-4">
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl p-3 rounded-2xl border-2 border-white/40 shadow-2xl">
        {/* Enhanced glassmorphism with glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-2xl" />
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.25), 0 0 20px rgba(255,255,255,0.1)'
        }} />
        
        {/* Fantasy Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('fantasy')}
          disabled={isTransitioning}
          className={`h-12 px-6 rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-bold text-sm ${
            currentRealm === 'fantasy'
              ? 'bg-purple-600/80 hover:bg-purple-700/80 shadow-lg shadow-purple-500/40 scale-105 border-2 border-purple-400/80'
              : 'bg-transparent border-2 border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="relative z-10 flex items-center gap-1">
            🏰 <span>Fantasy</span>
          </span>
          {currentRealm === 'fantasy' && (
            <div className="absolute inset-0 bg-purple-400/20 animate-pulse rounded-xl" />
          )}
        </Button>

        {/* Sci-Fi Realm Button */}
        <Button
          onClick={() => handleRealmSwitch('scifi')}
          disabled={isTransitioning}
          className={`h-12 px-6 rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden font-bold text-sm ${
            currentRealm === 'scifi'
              ? 'bg-cyan-600/80 hover:bg-cyan-700/80 shadow-lg shadow-cyan-500/40 scale-105 border-2 border-cyan-400/80'
              : 'bg-transparent border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400'
          } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <span className="relative z-10 flex items-center gap-1">
            🚀 <span>Sci-Fi</span>
          </span>
          {currentRealm === 'scifi' && (
            <div className="absolute inset-0 bg-cyan-400/20 animate-pulse rounded-xl" />
          )}
        </Button>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>

        {/* Hybrid Button */}
        <Button 
          onClick={onHybridClick}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500/70 to-cyan-500/70 hover:from-purple-600/70 hover:to-cyan-600/70 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 transition-all duration-300 relative overflow-hidden active:scale-95 shadow-lg shadow-purple-500/20 font-bold text-sm"
        >
          <span className="relative z-10 flex items-center gap-1 text-white">
            ✨ <span>Hybrid</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </Button>
      </div>
    </div>
  );
};

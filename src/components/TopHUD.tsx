
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface TopHUDProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  nexusShards: number;
  convergenceProgress: number;
  onHelpClick: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  realm,
  mana,
  energyCredits,
  nexusShards,
  convergenceProgress,
  onHelpClick
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between gap-2">
      {/* Main HUD bar with optimized spacing */}
      <div className="flex items-center bg-black/70 backdrop-blur-xl px-3 py-2.5 rounded-xl border border-white/20 shadow-xl flex-1"
        style={{
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))'
        }}>
        
        {/* Enhanced glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-xl" />
        
        <div className="flex items-center justify-between w-full text-sm font-semibold text-white relative z-10">
          {/* Resource stats with optimized spacing */}
          <div className="flex items-center gap-4">
            {/* Mana */}
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <span className="text-base">🔮</span>
              <span className="text-purple-300 font-bold">{formatNumber(mana)}</span>
            </span>
            
            {/* Energy */}
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <span className="text-base">⚡</span>
              <span className="text-cyan-300 font-bold">{formatNumber(energyCredits)}</span>
            </span>
            
            {/* Nexus Shards */}
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <span className="text-base">💎</span>
              <span className="text-yellow-300 font-bold">{formatNumber(nexusShards)}</span>
            </span>
            
            {/* Convergence */}
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <span className="text-base">🌌</span>
              <span className="text-orange-300 font-bold">{Math.floor(convergenceProgress)}%</span>
            </span>
          </div>
          
          {/* Right-aligned Realm Indicator */}
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all duration-300 flex-shrink-0 ${
            realm === 'fantasy'
              ? 'bg-purple-600/80 text-purple-200 shadow-purple-500/40 border border-purple-400/60'
              : 'bg-cyan-600/80 text-cyan-200 shadow-cyan-500/40 border border-cyan-400/60'
          }`}
          style={{
            filter: `drop-shadow(0 4px 12px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(34, 211, 238, 0.4)'})`
          }}>
            <span className="text-sm drop-shadow-sm">{realm === 'fantasy' ? '🏰' : '🚀'}</span>
            <span className="drop-shadow-sm whitespace-nowrap">{realm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}</span>
          </div>
        </div>
      </div>

      {/* Help Button with consistent styling */}
      <Button
        onClick={onHelpClick}
        size="sm"
        variant="ghost"
        className="h-11 w-11 p-0 rounded-xl bg-black/70 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-300 flex-shrink-0 shadow-xl hover:shadow-2xl hover:scale-105"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
        }}
      >
        <HelpCircle size={18} className="drop-shadow-sm" />
      </Button>
    </div>
  );
};

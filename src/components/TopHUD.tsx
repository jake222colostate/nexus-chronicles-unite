
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
    <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between">
      {/* Main HUD bar with fixed compact spacing */}
      <div className="flex items-center bg-black/60 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/30 shadow-xl flex-1 mr-3"
        style={{
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))'
        }}>
        
        {/* Enhanced glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/15 pointer-events-none rounded-xl" />
        
        <div className="flex items-center gap-3 text-sm font-medium text-white relative z-10 flex-1">
          {/* Mana */}
          <span className="flex items-center gap-1.5 drop-shadow-sm">
            <span className="text-base">🔮</span>
            <span className="text-purple-300 font-semibold">{formatNumber(mana)}</span>
          </span>
          
          <div className="w-px h-4 bg-white/40"></div>
          
          {/* Energy */}
          <span className="flex items-center gap-1.5 drop-shadow-sm">
            <span className="text-base">⚡</span>
            <span className="text-cyan-300 font-semibold">{formatNumber(energyCredits)}</span>
          </span>
          
          <div className="w-px h-4 bg-white/40"></div>
          
          {/* Nexus Shards */}
          <span className="flex items-center gap-1.5 drop-shadow-sm">
            <span className="text-base">💎</span>
            <span className="text-yellow-300 font-semibold">{formatNumber(nexusShards)}</span>
          </span>
          
          <div className="w-px h-4 bg-white/40"></div>
          
          {/* Convergence */}
          <span className="flex items-center gap-1.5 drop-shadow-sm">
            <span className="text-base">🌌</span>
            <span className="text-orange-300 font-semibold">{Math.floor(convergenceProgress)}%</span>
          </span>
          
          {/* Spacer to push realm indicator to the right */}
          <div className="flex-1"></div>
          
          {/* Enhanced Realm Indicator - properly aligned */}
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all duration-300 flex-shrink-0 ${
            realm === 'fantasy'
              ? 'bg-purple-600/70 text-purple-200 shadow-purple-500/30 border border-purple-400/50'
              : 'bg-cyan-600/70 text-cyan-200 shadow-cyan-500/30 border border-cyan-400/50'
          }`}
          style={{
            filter: `drop-shadow(0 4px 12px ${realm === 'fantasy' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(34, 211, 238, 0.3)'})`
          }}>
            <span className="text-sm drop-shadow-sm">{realm === 'fantasy' ? '🏰' : '🚀'}</span>
            <span className="drop-shadow-sm whitespace-nowrap">{realm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}</span>
          </div>
        </div>
      </div>

      {/* Help Button - enhanced with consistent glow */}
      <Button
        onClick={onHelpClick}
        size="sm"
        variant="ghost"
        className="h-10 w-10 p-0 rounded-xl bg-black/60 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 transition-all duration-300 flex-shrink-0 shadow-xl hover:shadow-2xl hover:scale-105"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
        }}
      >
        <HelpCircle size={16} className="drop-shadow-sm" />
      </Button>
    </div>
  );
};

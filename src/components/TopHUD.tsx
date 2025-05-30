
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
    <div className="absolute top-2 left-2 right-2 z-40 flex items-center justify-between">
      {/* Main HUD bar with all resources and realm indicator */}
      <div className="flex items-center gap-3 bg-black/50 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/25 shadow-lg flex-1 mr-2">
        {/* Enhanced glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-xl" />
        
        <div className="flex items-center gap-3 text-sm font-medium text-white relative z-10 flex-1">
          <span className="flex items-center gap-1">
            🔮 <span className="text-purple-300 font-semibold">{formatNumber(mana)}</span>
          </span>
          <div className="w-px h-4 bg-white/30"></div>
          <span className="flex items-center gap-1">
            ⚡ <span className="text-cyan-300 font-semibold">{formatNumber(energyCredits)}</span>
          </span>
          <div className="w-px h-4 bg-white/30"></div>
          <span className="flex items-center gap-1">
            💎 <span className="text-yellow-300 font-semibold">{formatNumber(nexusShards)}</span>
          </span>
          <div className="w-px h-4 bg-white/30"></div>
          <span className="flex items-center gap-1">
            🌌 <span className="text-orange-300 font-semibold">{Math.floor(convergenceProgress)}%</span>
          </span>
          <div className="w-px h-4 bg-white/30"></div>
          
          {/* Realm Indicator - integrated into the bar */}
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center ${
            realm === 'fantasy'
              ? 'bg-purple-600/60 text-purple-200'
              : 'bg-cyan-600/60 text-cyan-200'
          }`}>
            {realm === 'fantasy' ? '🏰' : '🚀'} {realm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}
          </div>
        </div>
      </div>

      {/* Help Button - compact and aligned */}
      <Button
        onClick={onHelpClick}
        size="sm"
        variant="ghost"
        className="h-9 w-9 p-0 rounded-xl bg-black/50 backdrop-blur-xl border border-white/25 text-white hover:bg-white/15 transition-all duration-200 flex-shrink-0"
      >
        <HelpCircle size={16} />
      </Button>
    </div>
  );
};

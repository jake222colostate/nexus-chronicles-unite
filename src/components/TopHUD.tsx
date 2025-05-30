
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
      {/* Left: Resources with improved spacing and alignment */}
      <div className="flex items-center gap-4 bg-black/50 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/25 shadow-lg">
        {/* Enhanced glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-2xl" />
        
        <div className="flex items-center gap-4 text-sm font-medium text-white relative z-10">
          <span className="flex items-center gap-1.5">
            🔮 <span className="text-purple-300 font-semibold">{formatNumber(mana)}</span>
          </span>
          <div className="w-px h-5 bg-white/30"></div>
          <span className="flex items-center gap-1.5">
            ⚡ <span className="text-cyan-300 font-semibold">{formatNumber(energyCredits)}</span>
          </span>
          <div className="w-px h-5 bg-white/30"></div>
          <span className="flex items-center gap-1.5">
            💎 <span className="text-yellow-300 font-semibold">{formatNumber(nexusShards)}</span>
          </span>
          <div className="w-px h-5 bg-white/30"></div>
          <span className="flex items-center gap-1.5">
            🌌 <span className="text-orange-300 font-semibold">{Math.floor(convergenceProgress)}%</span>
          </span>
        </div>
      </div>

      {/* Right: Realm indicator and help - properly aligned */}
      <div className="flex items-center gap-3">
        {/* Realm Indicator - aligned with HUD height */}
        <div className={`px-3 py-2.5 rounded-xl text-sm font-semibold border backdrop-blur-xl flex items-center ${
          realm === 'fantasy'
            ? 'bg-purple-600/80 border-purple-400/60 text-purple-100'
            : 'bg-cyan-600/80 border-cyan-400/60 text-cyan-100'
        }`}>
          {realm === 'fantasy' ? '🏰 Fantasy' : '🚀 Sci-Fi'}
        </div>

        {/* Help Button - aligned with HUD height */}
        <Button
          onClick={onHelpClick}
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0 rounded-xl bg-black/50 backdrop-blur-xl border border-white/25 text-white hover:bg-white/15 transition-all duration-200"
        >
          <HelpCircle size={18} />
        </Button>
      </div>
    </div>
  );
};

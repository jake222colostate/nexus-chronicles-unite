
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
    <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
      {/* Left: Resources */}
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-2xl" />
        
        <div className="flex items-center gap-3 text-sm font-semibold text-white relative z-10">
          <span className="flex items-center gap-1">
            🔮 <span className="text-purple-300">{formatNumber(mana)}</span>
          </span>
          <div className="w-px h-4 bg-white/30"></div>
          <span className="flex items-center gap-1">
            ⚡ <span className="text-cyan-300">{formatNumber(energyCredits)}</span>
          </span>
          <div className="w-px h-4 bg-white/30"></div>
          <span className="flex items-center gap-1">
            💎 <span className="text-yellow-300">{formatNumber(nexusShards)}</span>
          </span>
          <div className="w-px h-4 bg-white/30"></div>
          <span className="flex items-center gap-1">
            🌌 <span className="text-orange-300">{Math.floor(convergenceProgress)}%</span>
          </span>
        </div>
      </div>

      {/* Right: Realm indicator and help */}
      <div className="flex items-center gap-2">
        {/* Realm Indicator */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-xl ${
          realm === 'fantasy'
            ? 'bg-purple-600/80 border-purple-400/60 text-purple-100'
            : 'bg-cyan-600/80 border-cyan-400/60 text-cyan-100'
        }`}>
          {realm === 'fantasy' ? '🏰 Fantasy' : '🚀 Sci-Fi'}
        </div>

        {/* Help Button */}
        <Button
          onClick={onHelpClick}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10"
        >
          <HelpCircle size={16} />
        </Button>
      </div>
    </div>
  );
};

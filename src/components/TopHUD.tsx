
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface TopHUDProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  nexusShards: number;
  convergenceProgress: number;
  manaPerSecond: number;
  energyPerSecond: number;
  onHelpClick: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  realm,
  mana,
  energyCredits,
  nexusShards,
  convergenceProgress,
  manaPerSecond,
  energyPerSecond,
  onHelpClick
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const formatRate = (rate: number): string => {
    if (rate === 0) return '0';
    if (rate >= 1e6) return (rate / 1e6).toFixed(1) + 'M';
    if (rate >= 1e3) return (rate / 1e3).toFixed(1) + 'K';
    return rate.toFixed(1);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-40 iphone-safe-top">
      <div className="px-3 py-2">
        {/* Single unified HUD bar with help button on the left */}
        <div className="flex items-center bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 shadow-lg">
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-xl" />
          
          {/* Help Button - moved to far left */}
          <Button
            onClick={onHelpClick}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 mr-3"
          >
            <HelpCircle size={14} />
          </Button>

          {/* Stats container with proper spacing */}
          <div className="flex items-center gap-4 text-sm font-medium text-white relative z-10 flex-1 min-w-0">
            {/* Mana */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">🧠</span>
              <div className="flex flex-col">
                <span className="text-purple-300 font-semibold text-xs">{formatNumber(mana)}</span>
                <span className="text-purple-400/70 font-medium text-xs">+{formatRate(manaPerSecond)}/s</span>
              </div>
            </div>
            
            <div className="w-px h-4 bg-white/20 flex-shrink-0"></div>
            
            {/* Energy */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">⚡</span>
              <div className="flex flex-col">
                <span className="text-cyan-300 font-semibold text-xs">{formatNumber(energyCredits)}</span>
                <span className="text-cyan-400/70 font-medium text-xs">+{formatRate(energyPerSecond)}/s</span>
              </div>
            </div>
            
            <div className="w-px h-4 bg-white/20 flex-shrink-0"></div>
            
            {/* Crystals (Nexus Shards) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">💎</span>
              <span className="text-yellow-300 font-semibold text-xs">{formatNumber(nexusShards)}</span>
            </div>
            
            <div className="w-px h-4 bg-white/20 flex-shrink-0"></div>
            
            {/* Progress */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">🔄</span>
              <span className="text-orange-300 font-semibold text-xs">{Math.floor(convergenceProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';

interface ResourceTooltipProps {
  mana: number;
  energyCredits: number;
  manaPerSecond: number;
  energyPerSecond: number;
  convergenceProgress: number;
  realm: 'fantasy' | 'scifi';
}

export const ResourceTooltip: React.FC<ResourceTooltipProps> = ({
  mana,
  energyCredits,
  manaPerSecond,
  energyPerSecond,
  convergenceProgress,
  realm
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const formatRate = (rate: number): string => {
    if (rate === 0) return '0';
    return `+${formatNumber(rate)}`;
  };

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-35 pointer-events-none">
      <div className="bg-black/25 backdrop-blur-lg px-3 py-2 rounded-xl border border-white/20 shadow-lg">
        {/* Subtle glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none rounded-xl" />
        
        <div className="relative z-10 space-y-1 text-xs text-white/90">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              💠 <span className="text-purple-300">{formatNumber(mana)}</span>
              <span className="text-purple-200 text-xs">({formatRate(manaPerSecond)}/s)</span>
            </span>
            <span className="flex items-center gap-1">
              ⚡ <span className="text-cyan-300">{formatNumber(energyCredits)}</span>
              <span className="text-cyan-200 text-xs">({formatRate(energyPerSecond)}/s)</span>
            </span>
          </div>
          
          {convergenceProgress > 10 && (
            <div className="flex items-center gap-1 justify-center">
              <span className="text-orange-300">🌌 Convergence: {Math.floor(convergenceProgress)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

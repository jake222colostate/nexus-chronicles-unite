
import React from 'react';

interface MapStatsHUDProps {
  realm: 'fantasy' | 'scifi';
  manaPerSecond: number;
  energyPerSecond: number;
  convergenceProgress: number;
}

export const MapStatsHUD: React.FC<MapStatsHUDProps> = ({
  realm,
  manaPerSecond,
  energyPerSecond,
  convergenceProgress
}) => {
  const formatRate = (rate: number): string => {
    if (rate >= 1e6) return (rate / 1e6).toFixed(1) + 'M';
    if (rate >= 1e3) return (rate / 1e3).toFixed(1) + 'K';
    return rate.toFixed(1);
  };

  return (
    <div className="absolute top-4 right-4 z-20 max-w-[40%]">
      <div className="backdrop-blur-md bg-black/40 border border-white/20 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex flex-col gap-1 text-xs">
          {/* Mana Rate */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-purple-300 flex items-center gap-1">
              <span>💠</span>
              <span>Mana/s</span>
            </span>
            <span className="text-white font-medium">{formatRate(manaPerSecond)}</span>
          </div>
          
          {/* Energy Rate */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-cyan-300 flex items-center gap-1">
              <span>⚡</span>
              <span>Energy/s</span>
            </span>
            <span className="text-white font-medium">{formatRate(energyPerSecond)}</span>
          </div>
          
          {/* Convergence Progress */}
          {convergenceProgress > 5 && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
              <span className="text-yellow-300 flex items-center gap-1">
                <span>🌌</span>
                <span>Conv</span>
              </span>
              <span className="text-yellow-300 font-medium">{convergenceProgress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Sword } from 'lucide-react';

interface TopHUDProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  nexusShards: number;
  convergenceProgress: number;
  manaPerSecond: number;
  energyPerSecond: number;
  onHelpClick: () => void;
  onCombatUpgradesClick?: () => void;
  enemyCount?: number;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  realm,
  mana,
  energyCredits,
  nexusShards,
  convergenceProgress,
  manaPerSecond,
  energyPerSecond,
  onHelpClick,
  onCombatUpgradesClick,
  enemyCount = 0
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e30) return (num / 1e30).toFixed(1) + 'No';
    if (num >= 1e27) return (num / 1e27).toFixed(1) + 'Oc';
    if (num >= 1e24) return (num / 1e24).toFixed(1) + 'Sp';
    if (num >= 1e21) return (num / 1e21).toFixed(1) + 'Sx';
    if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Qi';
    if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Qa';
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const formatRate = (rate: number): string => {
    if (rate === 0) return '0';
    return formatNumber(rate);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-2 pointer-events-auto boundary-constrained">
      <div className="flex items-center justify-between bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
        {/* Help Button */}
        <Button
          onClick={onHelpClick}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-lg bg-transparent hover:bg-white/15 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0"
        >
          <HelpCircle size={14} />
        </Button>

        {/* Resources Row */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-white flex-1">
          {/* Mana */}
          <div className="flex items-center gap-1">
            <span className="text-sm">🧙‍♂️</span>
            <span className="text-purple-300">{formatNumber(mana)}</span>
            <span className="text-purple-200 text-xs">+{formatRate(manaPerSecond)}/s</span>
          </div>
          
          {/* Energy */}
          <div className="flex items-center gap-1">
            <span className="text-sm">⚡</span>
            <span className="text-cyan-300">{formatNumber(energyCredits)}</span>
            <span className="text-cyan-200 text-xs">+{formatRate(energyPerSecond)}/s</span>
          </div>
          
          {/* Nexus Shards */}
          <div className="flex items-center gap-1">
            <span className="text-sm">💎</span>
            <span className="text-yellow-300">{formatNumber(nexusShards)}</span>
          </div>
        </div>

        {/* Weapon Button */}
        {onCombatUpgradesClick && (
          <Button
            onClick={onCombatUpgradesClick}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg bg-transparent hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 relative flex-shrink-0"
          >
            <Sword size={14} />
            {enemyCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold">
                {enemyCount}
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

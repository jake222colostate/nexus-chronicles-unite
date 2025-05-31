
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
    <div className="absolute top-0 left-0 right-0 z-40">
      <div className="px-3 py-2">
        <div 
          className="flex items-center justify-between bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/25 relative min-h-[42px]"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none rounded-xl" />
          
          {/* Help Button */}
          <Button
            onClick={onHelpClick}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg bg-transparent hover:bg-white/15 hover:scale-105 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0"
          >
            <HelpCircle size={18} />
          </Button>

          {/* Main Resources - centered and properly spaced */}
          <div className="flex items-center justify-center gap-4 text-base font-bold text-white relative z-10 flex-1">
            {/* Mana */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-purple-300 font-bold text-sm">{formatNumber(mana)}</span>
              </div>
              <span className="text-xs text-purple-400 font-medium">+{formatRate(manaPerSecond)}/s</span>
            </div>
            
            {/* Energy */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                <span className="text-cyan-300 font-bold text-sm">{formatNumber(energyCredits)}</span>
              </div>
              <span className="text-xs text-cyan-400 font-medium">+{formatRate(energyPerSecond)}/s</span>
            </div>
            
            {/* Nexus Shards */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-300 font-bold text-sm">{formatNumber(nexusShards)}</span>
            </div>
          </div>

          {/* Combat Button */}
          {onCombatUpgradesClick && (
            <Button
              onClick={onCombatUpgradesClick}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-lg bg-transparent hover:bg-red-500/20 hover:scale-105 text-red-400 hover:text-red-300 transition-all duration-200 relative flex-shrink-0"
            >
              <Sword size={18} />
              {enemyCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {enemyCount}
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

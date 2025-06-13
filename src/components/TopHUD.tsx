
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
    <div className="fixed top-0 left-0 right-0 z-40 px-2 py-2 pointer-events-auto" style={{ maxWidth: 'var(--iphone-screen-width)', margin: '0 auto' }}>
      <div 
        className="flex items-center justify-between bg-black/85 backdrop-blur-xl px-3 py-2 rounded-lg border border-white/20 relative min-h-[36px] ml-[148px]"
        style={{
          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Enhanced glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-lg" />
        
        {/* Help Button */}
        <Button
          onClick={onHelpClick}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 rounded-lg bg-transparent hover:bg-white/15 hover:scale-105 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 pointer-events-auto"
        >
          <HelpCircle size={16} />
        </Button>

        {/* Main Resources - centered and properly spaced */}
        <div className="flex items-center justify-center gap-3 text-sm font-bold text-white relative z-10 flex-1">
          {/* Mana */}
          <div className="flex items-center gap-1" data-mana-display>
            <span className="text-sm">🧙‍♂️</span>
            <span className="text-purple-300 font-bold text-xs">{formatNumber(mana)}</span>
          </div>
          
          {/* Energy */}
          <div className="flex items-center gap-1" data-energy-display>
            <span className="text-sm">⚡</span>
            <span className="text-cyan-300 font-bold text-xs">{formatNumber(energyCredits)}</span>
          </div>
          
          {/* Nexus Shards */}
          <div className="flex items-center gap-1">
            <span className="text-sm">💎</span>
            <span className="text-yellow-300 font-bold text-xs">{formatNumber(nexusShards)}</span>
          </div>
        </div>

        {/* Combat Button */}
        {onCombatUpgradesClick && (
          <Button
            onClick={onCombatUpgradesClick}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 rounded-lg bg-transparent hover:bg-red-500/20 hover:scale-105 text-red-400 hover:text-red-300 transition-all duration-200 relative flex-shrink-0 pointer-events-auto"
          >
            <Sword size={16} />
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

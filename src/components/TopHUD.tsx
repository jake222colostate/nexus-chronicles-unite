
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
    if (num >= 1e63) return (num / 1e63).toFixed(1) + 'Vi';
    if (num >= 1e60) return (num / 1e60).toFixed(1) + 'Ud';
    if (num >= 1e57) return (num / 1e57).toFixed(1) + 'Td';
    if (num >= 1e54) return (num / 1e54).toFixed(1) + 'Sd';
    if (num >= 1e51) return (num / 1e51).toFixed(1) + 'Qd';
    if (num >= 1e48) return (num / 1e48).toFixed(1) + 'Qad';
    if (num >= 1e45) return (num / 1e45).toFixed(1) + 'Trd';
    if (num >= 1e42) return (num / 1e42).toFixed(1) + 'Dd';
    if (num >= 1e39) return (num / 1e39).toFixed(1) + 'Ud';
    if (num >= 1e36) return (num / 1e36).toFixed(1) + 'Und';
    if (num >= 1e33) return (num / 1e33).toFixed(1) + 'Dc';
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
    <div className="absolute top-0 left-0 right-0 z-40 iphone-safe-top">
      <div className="px-4 py-2">
        {/* Compacted HUD with improved spacing - 10% smaller height */}
        <div 
          className="flex items-center bg-black/70 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/20 relative min-h-[43px]"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.08)',
            borderRadius: '12px'
          }}
        >
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15 pointer-events-none rounded-xl" />
          
          {/* Help Button - compact size */}
          <Button
            onClick={onHelpClick}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg bg-transparent hover:bg-white/15 hover:scale-105 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 mr-3"
          >
            <HelpCircle size={18} />
          </Button>

          {/* Enemy Count Display - only show when enemies present */}
          {enemyCount > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0 mr-4">
              <span className="text-2xl leading-none">👁️</span>
              <span className="text-red-400 font-bold text-xl">{enemyCount}</span>
            </div>
          )}

          {/* Resource icons with 20% larger size and consistent 12px spacing */}
          <div className="flex items-center justify-between text-xl font-bold text-white relative z-10 flex-1 min-w-0 gap-3">
            {/* 🧠 Brain */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-2xl leading-none">🧠</span>
              <span className="text-purple-300 font-bold text-xl">{formatNumber(mana)}</span>
            </div>
            
            {/* ⚡ Energy */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-2xl leading-none">⚡</span>
              <span className="text-cyan-300 font-bold text-xl">{formatNumber(energyCredits)}</span>
            </div>
            
            {/* 💎 Crystals */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-2xl leading-none">💎</span>
              <span className="text-yellow-300 font-bold text-xl">{formatNumber(nexusShards)}</span>
            </div>
            
            {/* ✨ Mana with rate */}
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[100px]">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">✨</span>
                <span className="text-purple-300 font-bold text-xl">{formatNumber(mana)}</span>
              </div>
              <span className="text-sm text-purple-400 leading-tight font-medium">+{formatRate(manaPerSecond)}/s</span>
            </div>
            
            {/* 🔄 Progress */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-2xl leading-none">🔄</span>
              <span className="text-orange-300 font-bold text-xl">{Math.floor(convergenceProgress)}%</span>
            </div>
          </div>

          {/* Combat Upgrades Button */}
          {onCombatUpgradesClick && (
            <Button
              onClick={onCombatUpgradesClick}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-lg bg-transparent hover:bg-red-500/20 hover:scale-105 text-red-400 hover:text-red-300 transition-all duration-200 flex-shrink-0 ml-3"
            >
              <Sword size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

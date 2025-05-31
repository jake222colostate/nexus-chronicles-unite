
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
    if (num >= 1e24) return (num / 1e24).toFixed(1) + 'Sp';
    if (num >= 1e21) return (num / 1e21).toFixed(1) + 'Sx';
    if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Qa';
    if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Qd';
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
      <div className="px-3 py-1">
        {/* Compact unified stats bar - reduced height */}
        <div 
          className="flex items-center bg-black/70 backdrop-blur-xl px-2.5 py-1 rounded-lg border border-white/20 relative"
          style={{
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-lg" />
          
          {/* Help Button - compact */}
          <Button
            onClick={onHelpClick}
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0 rounded-md bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 mr-2"
          >
            <HelpCircle size={8} />
          </Button>

          {/* Evenly spaced stats layout */}
          <div className="flex items-center justify-between text-xs font-medium text-white relative z-10 flex-1 min-w-0">
            {/* 🧠 Brain */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[10px]">🧠</span>
              <span className="text-purple-300 font-semibold text-[10px]">{formatNumber(mana)}</span>
            </div>
            
            {/* ⚡ Energy */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[10px]">⚡</span>
              <span className="text-cyan-300 font-semibold text-[10px]">{formatNumber(energyCredits)}</span>
            </div>
            
            {/* 💎 Crystals */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[10px]">💎</span>
              <span className="text-yellow-300 font-semibold text-[10px]">{formatNumber(nexusShards)}</span>
            </div>
            
            {/* 🧱 Stone */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[10px]">🧱</span>
              <span className="text-orange-300 font-semibold text-[10px]">0</span>
            </div>
            
            {/* ✨ Mana with rate below */}
            <div className="flex flex-col items-end gap-0 flex-shrink-0">
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">✨</span>
                <span className="text-purple-300 font-semibold text-[10px]">{formatNumber(mana)}</span>
              </div>
              <span className="text-[8px] text-gray-400 leading-tight">+{formatRate(manaPerSecond)}/s</span>
            </div>
            
            {/* 🔄 Progress */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[10px]">🔄</span>
              <span className="text-orange-300 font-semibold text-[10px]">{Math.floor(convergenceProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


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
      <div className="px-4 py-3">
        {/* Enhanced unified stats bar with much larger icons and better spacing */}
        <div 
          className="flex items-center bg-black/80 backdrop-blur-xl px-6 py-5 rounded-2xl border-2 border-white/30 relative min-h-[80px]"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none rounded-2xl" />
          
          {/* Help Button - larger size */}
          <Button
            onClick={onHelpClick}
            size="sm"
            variant="ghost"
            className="h-12 w-12 p-0 rounded-xl bg-transparent hover:bg-white/20 hover:scale-110 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 mr-6"
          >
            <HelpCircle size={24} />
          </Button>

          {/* Much larger icons and numbers with generous spacing */}
          <div className="flex items-center justify-between text-xl font-bold text-white relative z-10 flex-1 min-w-0 gap-8">
            {/* 🧠 Brain - much larger icon and text */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-4xl leading-none">🧠</span>
              <span className="text-purple-300 font-bold text-xl">{formatNumber(mana)}</span>
            </div>
            
            {/* ⚡ Energy - much larger icon and text */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-4xl leading-none">⚡</span>
              <span className="text-cyan-300 font-bold text-xl">{formatNumber(energyCredits)}</span>
            </div>
            
            {/* 💎 Crystals - much larger icon and text */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-4xl leading-none">💎</span>
              <span className="text-yellow-300 font-bold text-xl">{formatNumber(nexusShards)}</span>
            </div>
            
            {/* 🧱 Stone - much larger icon and text */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-4xl leading-none">🧱</span>
              <span className="text-orange-300 font-bold text-xl">0</span>
            </div>
            
            {/* ✨ Mana with rate - much larger with better alignment */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-[120px]">
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none">✨</span>
                <span className="text-purple-300 font-bold text-xl">{formatNumber(mana)}</span>
              </div>
              <span className="text-base text-purple-400 leading-tight font-semibold">+{formatRate(manaPerSecond)}/s</span>
            </div>
            
            {/* 🔄 Progress - much larger icon and text */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-4xl leading-none">🔄</span>
              <span className="text-orange-300 font-bold text-xl">{Math.floor(convergenceProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

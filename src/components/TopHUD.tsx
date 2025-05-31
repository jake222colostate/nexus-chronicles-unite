
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
      <div className="px-3 py-2">
        {/* Enhanced unified stats bar with larger icons and better spacing */}
        <div 
          className="flex items-center bg-black/70 backdrop-blur-xl px-4 py-3 rounded-lg border border-white/20 relative min-h-[56px]"
          style={{
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-lg" />
          
          {/* Help Button - enhanced with larger size */}
          <Button
            onClick={onHelpClick}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-md bg-transparent hover:bg-white/20 hover:scale-110 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 mr-4"
          >
            <HelpCircle size={16} />
          </Button>

          {/* Larger icons and numbers with consistent spacing */}
          <div className="flex items-center justify-between text-sm font-medium text-white relative z-10 flex-1 min-w-0 gap-4">
            {/* 🧠 Brain - increased icon and text size */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg leading-none">🧠</span>
              <span className="text-purple-300 font-semibold text-sm">{formatNumber(mana)}</span>
            </div>
            
            {/* ⚡ Energy - increased icon and text size */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg leading-none">⚡</span>
              <span className="text-cyan-300 font-semibold text-sm">{formatNumber(energyCredits)}</span>
            </div>
            
            {/* 💎 Crystals - increased icon and text size */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg leading-none">💎</span>
              <span className="text-yellow-300 font-semibold text-sm">{formatNumber(nexusShards)}</span>
            </div>
            
            {/* 🧱 Stone - increased icon and text size */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg leading-none">🧱</span>
              <span className="text-orange-300 font-semibold text-sm">0</span>
            </div>
            
            {/* ✨ Mana with rate - increased icon and text size with better alignment */}
            <div className="flex flex-col items-end gap-0 flex-shrink-0 min-w-[70px]">
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">✨</span>
                <span className="text-purple-300 font-semibold text-sm">{formatNumber(mana)}</span>
              </div>
              <span className="text-xs text-gray-400 leading-tight">+{formatRate(manaPerSecond)}/s</span>
            </div>
            
            {/* 🔄 Progress - increased icon and text size */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg leading-none">🔄</span>
              <span className="text-orange-300 font-semibold text-sm">{Math.floor(convergenceProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

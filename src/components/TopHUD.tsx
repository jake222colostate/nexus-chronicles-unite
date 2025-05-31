
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
        {/* Single unified stats bar */}
        <div 
          className="flex items-center bg-black/70 backdrop-blur-xl px-3 py-2 rounded-lg border border-white/20 relative"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-lg" />
          
          {/* Help Button - flush left */}
          <Button
            onClick={onHelpClick}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 rounded-md bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 mr-3"
          >
            <HelpCircle size={12} />
          </Button>

          {/* Clean horizontal stats layout: 🧠 Brain ⚡ Energy 💎 Crystals 🧱 Resources ✨ Mana (+X/s) 🔄 Progress % */}
          <div className="flex items-center gap-4 text-sm font-medium text-white relative z-10 flex-1 min-w-0">
            {/* 🧠 Brain */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">🧠</span>
              <span className="text-purple-300 font-semibold">{formatNumber(mana)}</span>
            </div>
            
            {/* ⚡ Energy */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">⚡</span>
              <span className="text-cyan-300 font-semibold">{formatNumber(energyCredits)}</span>
            </div>
            
            {/* 💎 Crystals */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">💎</span>
              <span className="text-yellow-300 font-semibold">{formatNumber(nexusShards)}</span>
            </div>
            
            {/* 🧱 Resources (placeholder for future use) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">🧱</span>
              <span className="text-orange-300 font-semibold">0</span>
            </div>
            
            {/* ✨ Mana with rate inline */}
            <div className="flex flex-col items-center gap-0 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">✨</span>
                <span className="text-purple-300 font-semibold">{formatNumber(mana)}</span>
              </div>
              <span className="text-xs text-gray-400">+{formatRate(manaPerSecond)}/s</span>
            </div>
            
            {/* 🔄 Progress */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm">🔄</span>
              <span className="text-orange-300 font-semibold">{Math.floor(convergenceProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

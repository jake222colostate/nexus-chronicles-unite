
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface TopHUDProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  nexusShards: number;
  convergenceProgress: number;
  onHelpClick: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  realm,
  mana,
  energyCredits,
  nexusShards,
  convergenceProgress,
  onHelpClick
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-40 iphone-safe-top">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Main HUD bar with proper flex distribution */}
        <div className="flex items-center bg-black/50 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/25 shadow-lg flex-1 min-w-0">
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-xl" />
          
          <div className="flex items-center gap-2 text-sm font-medium text-white relative z-10 flex-1 min-w-0">
            {/* Resource indicators with consistent spacing */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm">🔮</span>
              <span className="text-purple-300 font-semibold text-xs">{formatNumber(mana)}</span>
            </div>
            
            <div className="w-px h-3 bg-white/30 flex-shrink-0"></div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm">⚡</span>
              <span className="text-cyan-300 font-semibold text-xs">{formatNumber(energyCredits)}</span>
            </div>
            
            <div className="w-px h-3 bg-white/30 flex-shrink-0"></div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm">💎</span>
              <span className="text-yellow-300 font-semibold text-xs">{formatNumber(nexusShards)}</span>
            </div>
            
            <div className="w-px h-3 bg-white/30 flex-shrink-0"></div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm">🌌</span>
              <span className="text-orange-300 font-semibold text-xs">{Math.floor(convergenceProgress)}%</span>
            </div>
            
            <div className="w-px h-3 bg-white/30 flex-shrink-0"></div>
            
            {/* Realm Indicator - properly sized and aligned */}
            <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${
              realm === 'fantasy'
                ? 'bg-purple-600/60 text-purple-200'
                : 'bg-cyan-600/60 text-cyan-200'
            }`}>
              <span className="text-xs">{realm === 'fantasy' ? '🏰' : '🚀'}</span>
              <span className="text-xs">{realm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'}</span>
            </div>
          </div>
        </div>

        {/* Help Button - consistent sizing */}
        <Button
          onClick={onHelpClick}
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 ml-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/25 text-white hover:bg-white/15 transition-all duration-200 flex-shrink-0"
        >
          <HelpCircle size={14} />
        </Button>
      </div>
    </div>
  );
};

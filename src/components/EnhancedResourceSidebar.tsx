
import React from 'react';
import { Card } from '@/components/ui/card';
import { Crown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedResourceSidebarProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  manaPerSecond: number;
  energyPerSecond: number;
  nexusShards: number;
  convergenceProgress: number;
  onHelpClick?: () => void;
}

export const EnhancedResourceSidebar: React.FC<EnhancedResourceSidebarProps> = ({
  realm,
  mana,
  energyCredits,
  manaPerSecond,
  energyPerSecond,
  nexusShards,
  convergenceProgress,
  onHelpClick
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const formatRate = (rate: number): string => {
    if (rate === 0) return '0';
    return `+${formatNumber(rate)}`;
  };

  return (
    <div className="absolute left-0 top-0 bottom-0 w-[100px] z-30 p-2">
      <div className="h-full flex flex-col justify-start pt-4">
        <Card className="backdrop-blur-md bg-black/60 border-white/30 relative">
          <div className="p-3 space-y-3">
            {/* Enhanced Header with Realm Info */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Crown size={12} className="text-yellow-400" />
                <span className="text-xs font-bold text-white">Nexus</span>
              </div>
              
              {/* Realm Header */}
              <div className={`text-xs px-2 py-1 rounded-full ${
                realm === 'fantasy'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-400/40'
                  : 'bg-cyan-600/30 text-cyan-200 border border-cyan-400/40'
              }`}>
                {realm === 'fantasy' ? '✨ Fantasy' : '⚡ Sci-Fi'}
              </div>
            </div>
            
            {/* Enhanced Mana Display */}
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="flex items-center justify-center gap-1 text-purple-300 text-xs mb-1">
                        <span>💠</span>
                        <span className="font-medium">Mana</span>
                      </div>
                      <div className="text-white font-bold text-sm">{formatNumber(mana)}</div>
                      <div className="text-purple-200 text-xs">({formatRate(manaPerSecond)}/s)</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-purple-900/90 border-purple-400/50">
                    <p className="text-xs">Mystical energy from Fantasy structures</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Section Divider */}
            <div className="w-full h-px bg-white/20"></div>

            {/* Enhanced Energy Display */}
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="flex items-center justify-center gap-1 text-cyan-300 text-xs mb-1">
                        <span>⚡</span>
                        <span className="font-medium">Energy</span>
                      </div>
                      <div className="text-white font-bold text-sm">{formatNumber(energyCredits)}</div>
                      <div className="text-cyan-200 text-xs">({formatRate(energyPerSecond)}/s)</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-cyan-900/90 border-cyan-400/50">
                    <p className="text-xs">Advanced power from Sci-Fi technology</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Convergence Progress - Enhanced */}
            {convergenceProgress > 10 && (
              <>
                <div className="w-full h-px bg-white/20"></div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-300 text-xs mb-1">
                    <span>🌌</span>
                    <span className="font-medium">Conv</span>
                  </div>
                  <div className="text-yellow-300 font-bold text-sm">{convergenceProgress.toFixed(0)}%</div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(convergenceProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Enhanced Nexus Shards */}
            <div className="w-full h-px bg-white/20"></div>
            <div className="text-center">
              <div className={`text-yellow-400 font-bold text-xs ${
                nexusShards === 0 ? 'animate-pulse' : ''
              }`}>
                <span className="block">🔮 {nexusShards}</span>
                <span className="text-[10px] text-yellow-200">Shards</span>
              </div>
            </div>
          </div>

          {/* Help Button */}
          {onHelpClick && (
            <div className="absolute -top-2 -right-2">
              <Button
                onClick={onHelpClick}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/30"
              >
                <HelpCircle size={12} className="text-white/80" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

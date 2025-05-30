
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
    <div className="absolute left-0 top-0 bottom-0 w-[110px] z-30 p-3">
      <div className="h-full flex flex-col justify-start pt-6">
        <Card className="backdrop-blur-xl bg-black/30 border-2 border-white/40 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Enhanced glassmorphism with glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none rounded-2xl" />
          <div className="absolute inset-0 shadow-inner rounded-2xl pointer-events-none" style={{
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.25), 0 0 20px rgba(255,255,255,0.1)'
          }} />
          
          <div className="relative p-3 space-y-3">
            {/* Nexus Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1">
                <Crown size={12} className="text-yellow-400" />
                <span className="text-xs font-bold text-white">Nexus</span>
              </div>
              
              {/* Active Realm Display */}
              <div className={`text-xs px-2 py-1 rounded-full border transition-all duration-300 ${
                realm === 'fantasy'
                  ? 'bg-purple-600/40 text-purple-100 border-purple-400/60 shadow-lg shadow-purple-500/20'
                  : 'bg-cyan-600/40 text-cyan-100 border-cyan-400/60 shadow-lg shadow-cyan-500/20'
              }`}>
                <span className="font-medium text-xs">
                  {realm === 'fantasy' ? '✨ Fantasy' : '⚡ Sci-Fi'}
                </span>
              </div>
            </div>
            
            {/* Section Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            {/* Mana Section - Horizontal Layout */}
            <div className="space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="flex items-center gap-1 text-purple-300 text-xs">
                        <span>💠</span>
                        <span className="font-bold">Mana</span>
                      </div>
                      <div className="text-white font-bold text-xs ml-3">{formatNumber(mana)}</div>
                      <div className="text-purple-200 text-xs ml-3">({formatRate(manaPerSecond)}/s)</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-purple-900/90 border-purple-400/50">
                    <p className="text-xs">Mystical energy from Fantasy structures</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Energy Section - Horizontal Layout */}
            <div className="space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="flex items-center gap-1 text-cyan-300 text-xs">
                        <span>⚡</span>
                        <span className="font-bold">Energy</span>
                      </div>
                      <div className="text-white font-bold text-xs ml-3">{formatNumber(energyCredits)}</div>
                      <div className="text-cyan-200 text-xs ml-3">({formatRate(energyPerSecond)}/s)</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-cyan-900/90 border-cyan-400/50">
                    <p className="text-xs">Advanced power from Sci-Fi technology</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Convergence Progress */}
            {convergenceProgress > 10 && (
              <>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-yellow-300 text-xs">
                    <span>🌌</span>
                    <span className="font-bold">Conv</span>
                  </div>
                  <div className="text-yellow-300 font-bold text-xs ml-3">{convergenceProgress.toFixed(0)}%</div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-1 ml-3 mr-1">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(convergenceProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Section Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            {/* Nexus Shards */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <span>👑</span>
                <span className="font-bold">Shards</span>
              </div>
              <div className={`inline-block px-2 py-1 rounded-lg border-2 transition-all duration-300 ml-3 ${
                nexusShards === 0 
                  ? 'border-yellow-400/60 bg-yellow-900/20 animate-pulse' 
                  : 'border-yellow-400/80 bg-yellow-900/40 shadow-lg shadow-yellow-500/20'
              }`}>
                <span className="text-yellow-400 font-bold text-xs">
                  🔮 {nexusShards}
                </span>
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
                className="h-6 w-6 p-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm shadow-lg"
              >
                <HelpCircle size={10} className="text-white/80" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

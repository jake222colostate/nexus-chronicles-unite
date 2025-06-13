
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Zap, Star } from 'lucide-react';

interface MobileResourceSidebarProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  manaPerSecond: number;
  energyPerSecond: number;
  nexusShards: number;
  autoManaLevel: number;
  autoManaRate: number;
  onAutoManaUpgrade: (cost: number) => void;
}

export const MobileResourceSidebar: React.FC<MobileResourceSidebarProps> = ({
  realm,
  mana,
  energyCredits,
  manaPerSecond,
  energyPerSecond,
  nexusShards,
  autoManaLevel,
  autoManaRate,
  onAutoManaUpgrade
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const formatRate = (rate: number): string => {
    if (rate >= 1e6) return (rate / 1e6).toFixed(1) + 'M';
    if (rate >= 1e3) return (rate / 1e3).toFixed(1) + 'K';
    return rate.toFixed(1);
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex flex-col gap-1.5 w-[170px] sm:w-[190px] pt-[5vh] px-1">
      {/* Mana Resource */}
      <Card className={`backdrop-blur-md border transition-all duration-300 ${
        realm === 'fantasy'
          ? 'bg-gradient-to-br from-purple-900/95 to-violet-800/95 border-purple-400/50 shadow-sm shadow-purple-500/20'
          : 'bg-gradient-to-br from-slate-800/95 to-gray-700/95 border-slate-400/50 shadow-sm'
      }`}>
        <div className="p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className={`w-3 h-3 ${realm === 'fantasy' ? 'text-purple-300' : 'text-blue-300'}`} />
            <span className="text-white font-semibold text-xs">Mana</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-white text-sm font-bold">{formatNumber(mana)}</div>
            <div className={`text-xs ${realm === 'fantasy' ? 'text-purple-200' : 'text-blue-200'}`}>
              +{formatRate(manaPerSecond)}/sec
            </div>
            <Progress 
              value={Math.min((mana / 1000) * 100, 100)} 
              className="h-1.5"
            />
          </div>
        </div>
      </Card>

      {/* Energy Credits Resource */}
      <Card className={`backdrop-blur-md border transition-all duration-300 ${
        realm === 'scifi'
          ? 'bg-gradient-to-br from-cyan-900/95 to-blue-800/95 border-cyan-400/50 shadow-sm shadow-cyan-500/20'
          : 'bg-gradient-to-br from-slate-800/95 to-gray-700/95 border-slate-400/50 shadow-sm'
      }`}>
        <div className="p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className={`w-3 h-3 ${realm === 'scifi' ? 'text-cyan-300' : 'text-green-300'}`} />
            <span className="text-white font-semibold text-xs">Energy</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-white text-sm font-bold">{formatNumber(energyCredits)}</div>
            <div className={`text-xs ${realm === 'scifi' ? 'text-cyan-200' : 'text-green-200'}`}>
              +{formatRate(energyPerSecond)}/sec
            </div>
            <Progress 
              value={Math.min((energyCredits / 1000) * 100, 100)} 
              className="h-1.5"
            />
          </div>
        </div>
      </Card>

      {/* Nexus Shards Resource */}
      <Card className="backdrop-blur-md bg-gradient-to-br from-yellow-900/95 to-orange-800/95 border border-yellow-400/50 shadow-sm shadow-yellow-500/20">
        <div className="p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="w-3 h-3 text-yellow-300" />
            <span className="text-white font-semibold text-xs">Nexus</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-white text-sm font-bold">{formatNumber(nexusShards)}</div>
            <div className="text-xs text-yellow-200">
              Convergence
            </div>
            <Progress 
              value={Math.min((nexusShards / 100) * 100, 100)} 
              className="h-1.5"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

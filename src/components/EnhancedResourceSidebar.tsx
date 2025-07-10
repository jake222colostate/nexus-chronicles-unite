
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Zap, Star } from 'lucide-react';
import { AutoManaUpgradeSystem } from './AutoManaUpgradeSystem';

interface EnhancedResourceSidebarProps {
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

export const EnhancedResourceSidebar: React.FC<EnhancedResourceSidebarProps> = ({
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
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
      {/* Mana Resource */}
      <Card className={`backdrop-blur-md border-2 transition-all duration-300 ${
        realm === 'fantasy'
          ? 'bg-gradient-to-br from-purple-900/95 to-violet-800/95 border-purple-400 shadow-lg shadow-purple-500/25'
          : 'bg-gradient-to-br from-slate-800/95 to-gray-700/95 border-slate-400 shadow-lg'
      }`}>
        <div className="p-3 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-4 h-4 ${realm === 'fantasy' ? 'text-purple-300' : 'text-blue-300'}`} />
            <span className="text-white font-bold text-sm">Mana</span>
          </div>
          <div className="space-y-1">
            <div className="text-white text-lg font-bold">{formatNumber(mana)}</div>
            <div className={`text-xs ${realm === 'fantasy' ? 'text-purple-200' : 'text-blue-200'}`}>
              +{formatRate(manaPerSecond)}/sec
            </div>
            <Progress 
              value={Math.min((mana / 1000) * 100, 100)} 
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {/* Auto Mana Upgrade System - Centered between resource bars */}
      <Card className={`backdrop-blur-md border-2 transition-all duration-300 ${
        realm === 'fantasy'
          ? 'bg-gradient-to-br from-purple-900/90 to-violet-800/90 border-purple-400/50'
          : 'bg-gradient-to-br from-slate-800/90 to-gray-700/90 border-slate-400/50'
      }`}>
        <AutoManaUpgradeSystem
          autoManaLevel={autoManaLevel}
          autoManaRate={autoManaRate}
          currentMana={mana}
          onUpgrade={onAutoManaUpgrade}
        />
      </Card>

      {/* Energy Credits Resource */}
      <Card className={`backdrop-blur-md border-2 transition-all duration-300 ${
        realm === 'scifi'
          ? 'bg-gradient-to-br from-cyan-900/95 to-blue-800/95 border-cyan-400 shadow-lg shadow-cyan-500/25'
          : 'bg-gradient-to-br from-slate-800/95 to-gray-700/95 border-slate-400 shadow-lg'
      }`}>
        <div className="p-3 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-4 h-4 ${realm === 'scifi' ? 'text-cyan-300' : 'text-green-300'}`} />
            <span className="text-white font-bold text-sm">Energy</span>
          </div>
          <div className="space-y-1">
            <div className="text-white text-lg font-bold">{formatNumber(energyCredits)}</div>
            <div className={`text-xs ${realm === 'scifi' ? 'text-cyan-200' : 'text-green-200'}`}>
              +{formatRate(energyPerSecond)}/sec
            </div>
            <Progress 
              value={Math.min((energyCredits / 1000) * 100, 100)} 
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {/* Nexus Shards Resource */}
      <Card className="backdrop-blur-md bg-gradient-to-br from-yellow-900/95 to-orange-800/95 border-2 border-yellow-400 shadow-lg shadow-yellow-500/25">
        <div className="p-3 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-white font-bold text-sm">Nexus Shards</span>
          </div>
          <div className="space-y-1">
            <div className="text-white text-lg font-bold">{formatNumber(nexusShards)}</div>
            <div className="text-xs text-yellow-200">
              Realm Convergence
            </div>
            <Progress 
              value={Math.min((nexusShards / 100) * 100, 100)} 
              className="h-2"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

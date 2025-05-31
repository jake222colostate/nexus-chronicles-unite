
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Zap } from 'lucide-react';
import { ConvergenceData } from '../types/GameTypes';

interface ConvergenceSystemProps {
  gameState: any;
  onPerformConvergence: () => void;
}

export const ConvergenceSystem: React.FC<ConvergenceSystemProps> = React.memo(({
  gameState,
  onPerformConvergence
}) => {
  // Memoize convergence data calculation to prevent unnecessary recalculations
  const convergenceData: ConvergenceData = useMemo(() => {
    const totalValue = gameState.mana + gameState.energyCredits;
    const baseThreshold = 1000;
    const threshold = Math.floor(baseThreshold * Math.pow(2, gameState.convergenceCount));
    const shardsToGain = Math.floor(Math.sqrt(totalValue / 1000)) + gameState.convergenceCount;
    const multiplier = 1 + (gameState.nexusShards * 0.01);
    
    return {
      available: totalValue >= threshold,
      threshold,
      currentProgress: totalValue,
      shardsToGain,
      multiplier
    };
  }, [gameState.mana, gameState.energyCredits, gameState.convergenceCount, gameState.nexusShards]);

  // Memoize format number function
  const formatNumber = useMemo(() => {
    return (num: number): string => {
      if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
      if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
      return Math.floor(num).toString();
    };
  }, []);

  const progressPercentage = useMemo(() => {
    return Math.min((convergenceData.currentProgress / convergenceData.threshold) * 100, 100);
  }, [convergenceData.currentProgress, convergenceData.threshold]);

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/80 to-cyan-900/80 border-2 border-yellow-400">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Convergence Portal</h2>
          <Sparkles className="text-yellow-400" size={24} />
        </div>

        <p className="text-white/80 text-sm">
          Unite the realms and transcend to a higher timeline
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>Progress</span>
            <span>{formatNumber(convergenceData.currentProgress)} / {formatNumber(convergenceData.threshold)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-center text-xs text-white/70">
            {progressPercentage.toFixed(1)}% Complete
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="bg-black/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="text-yellow-400" size={20} />
            <span className="text-yellow-400 font-bold text-lg">
              +{convergenceData.shardsToGain} Nexus Shards
            </span>
          </div>
          
          <div className="text-white/70 text-xs">
            Current Multiplier: {convergenceData.multiplier.toFixed(2)}x
          </div>
          
          {gameState.convergenceCount > 0 && (
            <div className="text-purple-300 text-xs">
              Convergence #{gameState.convergenceCount + 1}
            </div>
          )}
        </div>

        {/* Convergence Button */}
        <Button
          onClick={onPerformConvergence}
          disabled={!convergenceData.available}
          size="lg"
          className={`w-full ${
            convergenceData.available
              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 animate-pulse'
              : 'bg-gray-600'
          }`}
        >
          <Zap className="mr-2" size={20} />
          {convergenceData.available ? 'Initiate Convergence' : 'Convergence Locked'}
        </Button>

        {/* Warning Text */}
        {convergenceData.available && (
          <div className="text-yellow-300 text-xs bg-yellow-900/20 p-2 rounded border border-yellow-600">
            ⚠️ This will reset both realms but grant powerful permanent upgrades
          </div>
        )}
      </div>
    </Card>
  );
});

ConvergenceSystem.displayName = 'ConvergenceSystem';

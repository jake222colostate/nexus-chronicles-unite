import React from 'react';
import { Button } from '@/components/ui/button';
import { useAutoClickerStore } from '@/stores/useAutoClickerStore';

interface NexusAutoUpgradeSystemProps {
  currentNexusShards: number;
  onUpgrade: (cost: number) => void;
}

export const NexusAutoUpgradeSystem: React.FC<NexusAutoUpgradeSystemProps> = ({
  currentNexusShards,
  onUpgrade
}) => {
  const { level, manaPerSecond, upgradeCost, upgrade } = useAutoClickerStore();

  const handleUpgrade = () => {
    if (currentNexusShards >= upgradeCost) {
      onUpgrade(upgradeCost);
      upgrade();
    }
  };

  const canAfford = currentNexusShards >= upgradeCost;

  return (
    <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={handleUpgrade}
          disabled={!canAfford}
          className={`h-10 px-4 rounded-xl backdrop-blur-xl border transition-all duration-300 font-bold shadow-lg ${
            canAfford
              ? 'bg-gradient-to-r from-indigo-500/95 to-purple-500/95 hover:from-indigo-600/95 hover:to-purple-600/95 border-indigo-400/70 shadow-indigo-500/30 text-white animate-pulse'
              : 'bg-gray-600/50 border-gray-500/50 text-gray-400 cursor-not-allowed'
          }`}
          style={canAfford ? { animationDuration: '3s' } : {}}
        >
          🌌 Nexus Core Lvl {level} - {upgradeCost} Shards
        </Button>
        <p className="text-center text-xs text-indigo-300 font-medium">
          +{manaPerSecond} nexus/sec
        </p>
      </div>
    </div>
  );
};
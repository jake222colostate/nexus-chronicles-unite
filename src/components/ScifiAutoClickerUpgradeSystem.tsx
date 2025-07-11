
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAutoEnergyStore } from '@/stores/useAutoEnergyStore';

interface ScifiAutoClickerUpgradeSystemProps {
  currentEnergy: number;
  onUpgrade: (cost: number) => void;
}

export const ScifiAutoClickerUpgradeSystem: React.FC<ScifiAutoClickerUpgradeSystemProps> = ({
  currentEnergy,
  onUpgrade
}) => {
  const { level, energyPerSecond, upgradeCost, upgrade } = useAutoEnergyStore();

  const handleUpgrade = () => {
    if (currentEnergy >= upgradeCost) {
      onUpgrade(upgradeCost);
      upgrade();
    }
  };

  const canAfford = currentEnergy >= upgradeCost;

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={handleUpgrade}
          disabled={!canAfford}
          className={`h-10 px-4 rounded-xl backdrop-blur-xl border transition-all duration-300 font-bold shadow-lg ${
            canAfford
              ? 'bg-gradient-to-r from-cyan-500/95 to-blue-500/95 hover:from-cyan-600/95 hover:to-blue-600/95 border-cyan-400/70 shadow-cyan-500/30 text-white animate-pulse'
              : 'bg-gray-600/50 border-gray-500/50 text-gray-400 cursor-not-allowed'
          }`}
          style={canAfford ? { animationDuration: '3s' } : {}}
        >
          🤖 Auto Energy Lvl {level} - {upgradeCost} Energy
        </Button>
        <p className="text-center text-xs text-cyan-300 font-medium">
          +{energyPerSecond} energy/sec
        </p>
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { useAutoManaStore } from '@/stores/useAutoManaStore';

interface FantasyAutoClickerUpgradeSystemProps {
  currentMana: number;
  onUpgrade: (cost: number) => void;
}

export const FantasyAutoClickerUpgradeSystem: React.FC<FantasyAutoClickerUpgradeSystemProps> = ({
  currentMana,
  onUpgrade
}) => {
  const { level, manaPerSecond, upgradeCost, upgrade } = useAutoManaStore();

  const handleUpgrade = () => {
    if (currentMana >= upgradeCost) {
      onUpgrade(upgradeCost);
      upgrade();
    }
  };

  const canAfford = currentMana >= upgradeCost;

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={handleUpgrade}
          disabled={!canAfford}
          className={`h-10 px-4 rounded-xl backdrop-blur-xl border transition-all duration-300 font-bold shadow-lg ${
            canAfford
              ? 'bg-gradient-to-r from-purple-500/95 to-violet-500/95 hover:from-purple-600/95 hover:to-violet-600/95 border-purple-400/70 shadow-purple-500/30 text-white animate-pulse'
              : 'bg-gray-600/50 border-gray-500/50 text-gray-400 cursor-not-allowed'
          }`}
          style={canAfford ? { animationDuration: '3s' } : {}}
        >
          🧙‍♂️ Auto Mana Lvl {level} - {upgradeCost} Mana
        </Button>
        <p className="text-center text-xs text-purple-300 font-medium">
          +{manaPerSecond} mana/sec
        </p>
      </div>
    </div>
  );
};

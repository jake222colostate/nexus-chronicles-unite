
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AutoManaUpgradeBoxProps {
  autoManaLevel: number;
  autoManaRate: number;
  currentMana: number;
  onUpgrade: (cost: number) => void;
}

export const AutoManaUpgradeBox: React.FC<AutoManaUpgradeBoxProps> = ({
  autoManaLevel,
  autoManaRate,
  currentMana,
  onUpgrade
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const upgradeCost = Math.floor(50 * Math.pow(1.5, autoManaLevel));
  const canUpgrade = currentMana >= upgradeCost;

  const handleUpgrade = () => {
    if (canUpgrade) {
      onUpgrade(upgradeCost);
    }
  };

  return (
    <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto boundary-constrained">
      <Card className="bg-purple-900/90 border-purple-400/50 backdrop-blur-sm px-3 py-1.5 min-w-[260px]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs">🧙‍♂️</span>
            <span className="text-white font-medium text-xs">Auto Mana Lvl {autoManaLevel}</span>
            <span className="text-purple-300 text-xs">- {formatNumber(upgradeCost)} Mana</span>
          </div>
          <div className="text-purple-200 text-xs mb-1.5">
            +{autoManaRate} mana/sec
          </div>
          <Button
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            size="sm"
            className={`w-full text-xs h-6 ${
              canUpgrade
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canUpgrade ? 'Upgrade' : 'Insufficient Mana'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

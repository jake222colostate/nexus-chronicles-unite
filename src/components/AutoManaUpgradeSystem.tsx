
import React from 'react';
import { Button } from '@/components/ui/button';

interface AutoManaUpgradeSystemProps {
  autoManaLevel: number;
  autoManaRate: number;
  currentMana: number;
  onUpgrade: (cost: number) => void;
}

export const AutoManaUpgradeSystem: React.FC<AutoManaUpgradeSystemProps> = ({
  autoManaLevel,
  autoManaRate,
  currentMana,
  onUpgrade
}) => {
  // Calculate upgrade cost and next rate
  const calculateUpgradeCost = (level: number): number => {
    return Math.floor(50 * Math.pow(1.25, level));
  };

  const calculateRate = (level: number): number => {
    return level * 2; // 2 mana/sec per level
  };

  const upgradeCost = calculateUpgradeCost(autoManaLevel);
  const nextRate = calculateRate(autoManaLevel + 1);
  const canAfford = currentMana >= upgradeCost;

  const handleUpgrade = () => {
    if (canAfford) {
      onUpgrade(upgradeCost);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        onClick={handleUpgrade}
        disabled={!canAfford}
        className={`
          transition-all duration-300 font-bold text-xs px-3 py-1.5 rounded-md
          bg-gradient-to-r from-purple-600 to-violet-700 
          hover:from-purple-500 hover:to-violet-600
          disabled:opacity-50 disabled:cursor-not-allowed
          text-white border border-purple-400/30
          ${canAfford ? 'hover:scale-105 active:scale-95 shadow-md hover:shadow-purple-500/25' : ''}
        `}
        style={{
          minWidth: '140px',
          fontSize: '10px',
          boxShadow: canAfford ? '0 2px 8px rgba(147, 51, 234, 0.3)' : undefined
        }}
      >
        Auto Lvl {autoManaLevel} - {formatNumber(upgradeCost)}
      </Button>
      
      <div className="text-center">
        <div className="text-xs font-medium text-purple-300">
          +{formatNumber(autoManaRate)}/sec
        </div>
        {autoManaLevel > 0 && (
          <div className="text-xs text-purple-400/70">
            Next: +{formatNumber(nextRate)}/sec
          </div>
        )}
      </div>
    </div>
  );
};

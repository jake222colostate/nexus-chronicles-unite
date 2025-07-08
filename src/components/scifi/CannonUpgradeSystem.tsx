import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface CannonUpgradeSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentCannonCount: number;
  energyCredits: number;
  onUpgradeCannonCount: (cost: number) => void;
}

export const CannonUpgradeSystem: React.FC<CannonUpgradeSystemProps> = ({
  isOpen,
  onClose,
  currentCannonCount,
  energyCredits,
  onUpgradeCannonCount
}) => {
  const getUpgradeCost = (currentCount: number) => {
    return Math.floor(500 * Math.pow(1.5, currentCount));
  };

  const canAfford = (cost: number) => energyCredits >= cost;
  const canUpgrade = currentCannonCount < 10;
  const upgradeCost = getUpgradeCost(currentCannonCount);

  const handleUpgrade = () => {
    if (canAfford(upgradeCost) && canUpgrade) {
      onUpgradeCannonCount(upgradeCost);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-lg p-6 max-w-md w-full mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-cyan-100">Cannon Upgrades</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/50"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Current Stats */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
          <h3 className="text-lg font-semibold text-cyan-200 mb-2">Current Defense</h3>
          <div className="space-y-2 text-cyan-100">
            <div>Active Cannons: {currentCannonCount}/10</div>
            <div>Energy Credits: {energyCredits.toLocaleString()}</div>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="space-y-4">
          {/* Cannon Count Upgrade */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-cyan-200">
                Add Cannon
              </h3>
              <Plus className="text-cyan-400" size={20} />
            </div>
            
            <p className="text-sm text-cyan-300 mb-3">
              Deploy an additional cannon to the platform defense system
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-cyan-100">
                Cost: {upgradeCost.toLocaleString()} Energy
              </span>
              <Button
                onClick={handleUpgrade}
                disabled={!canAfford(upgradeCost) || !canUpgrade}
                className="bg-cyan-600 hover:bg-cyan-700 text-cyan-100 disabled:bg-gray-600 disabled:text-gray-400"
              >
                {!canUpgrade ? 'Max Reached' : 
                 !canAfford(upgradeCost) ? 'Not Enough Energy' : 
                 'Upgrade'}
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="text-center text-cyan-400 text-sm">
            Maximum 10 cannons can be deployed on the platform
          </div>
        </div>
      </div>
    </div>
  );
};
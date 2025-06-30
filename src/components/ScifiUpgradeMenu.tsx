
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Lock } from 'lucide-react';

export interface ScifiUpgrade {
  id: string;
  name: string;
  cost: number;
  bonus: string;
  description: string;
  isSpecial?: boolean;
  purchased?: boolean;
  unlockRequirement?: {
    fantasyUpgrades: number;
  };
}

interface ScifiUpgradeMenuProps {
  upgrade: ScifiUpgrade;
  energyCredits: number;
  fantasyUpgradeCount?: number;
  onPurchase: (upgradeId: string) => void;
  onClose: () => void;
}

export const ScifiUpgradeMenu: React.FC<ScifiUpgradeMenuProps> = ({
  upgrade,
  energyCredits,
  fantasyUpgradeCount = 0,
  onPurchase,
  onClose
}) => {
  const isUnlocked = !upgrade.unlockRequirement || fantasyUpgradeCount >= upgrade.unlockRequirement.fantasyUpgrades;
  const canAfford = energyCredits >= upgrade.cost && !upgrade.purchased && isUnlocked;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl p-6 w-80 mx-4 relative">
        {/* Close Button */}
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X size={16} />
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {upgrade.isSpecial && <span className="text-yellow-400">⭐</span>}
            {upgrade.name}
          </h2>
          {upgrade.description && (
            <p className="text-white/80 text-sm mt-2">{upgrade.description}</p>
          )}
        </div>

        {/* Cost and Bonus */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white/90 font-medium">Cost:</span>
            <span className="text-yellow-400 font-bold">{upgrade.cost} Energy</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/90 font-medium">Bonus:</span>
            <span className="text-green-400 font-bold">{upgrade.bonus}</span>
          </div>
        </div>

        {/* Unlock Requirements */}
        {!isUnlocked && upgrade.unlockRequirement && (
          <div className="bg-red-900/30 border border-red-400/40 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-300 text-sm font-medium">
              <Lock size={14} />
              Requires {upgrade.unlockRequirement.fantasyUpgrades} Fantasy upgrades
            </div>
            <p className="text-red-200/80 text-xs mt-1">
              Purchase more upgrades in the Fantasy realm to unlock this.
            </p>
          </div>
        )}

        {upgrade.isSpecial && isUnlocked && (
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3 mb-4">
            <p className="text-yellow-300 text-sm font-medium">
              ⭐ Special Upgrade: Unlocks Nexus Shard earning!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-600/50 hover:bg-gray-500/50 text-white border-0"
          >
            Close
          </Button>
          <Button
            onClick={() => onPurchase(upgrade.id)}
            disabled={!canAfford}
            className={`flex-1 ${
              upgrade.purchased
                ? 'bg-green-600/50 text-green-300 cursor-not-allowed'
                : !isUnlocked
                ? 'bg-gray-600/50 cursor-not-allowed'
                : canAfford
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600/50 cursor-not-allowed'
            }`}
          >
            {upgrade.purchased ? 'Purchased' : !isUnlocked ? 'Locked' : 'Purchase'}
          </Button>
        </div>
      </div>
    </div>
  );
};

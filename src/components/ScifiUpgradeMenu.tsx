
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface ScifiUpgrade {
  id: string;
  name: string;
  cost: number;
  bonus: string;
  description: string;
  isSpecial?: boolean;
  purchased?: boolean;
}

interface ScifiUpgradeMenuProps {
  upgrade: ScifiUpgrade;
  energyCredits: number;
  onPurchase: (upgradeId: string) => void;
  onClose: () => void;
}

export const ScifiUpgradeMenu: React.FC<ScifiUpgradeMenuProps> = ({
  upgrade,
  energyCredits,
  onPurchase,
  onClose
}) => {
  const canAfford = energyCredits >= upgrade.cost && !upgrade.purchased;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-800/95 to-blue-900/95 backdrop-blur-xl rounded-xl border border-cyan-400/30 p-6 w-80 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {upgrade.isSpecial && <span className="text-yellow-400">⭐</span>}
            {upgrade.name}
          </h2>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-cyan-300 font-medium">Cost:</span>
            <span className="text-yellow-400 font-bold">{upgrade.cost} Energy</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-cyan-300 font-medium">Bonus:</span>
            <span className="text-green-400 font-bold">{upgrade.bonus}</span>
          </div>

          {upgrade.description && (
            <p className="text-white/80 text-sm">{upgrade.description}</p>
          )}

          {upgrade.isSpecial && (
            <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3">
              <p className="text-yellow-300 text-sm font-medium">
                ⭐ Special Upgrade: Unlocks Nexus Shard earning!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
            >
              Close
            </Button>
            <Button
              onClick={() => onPurchase(upgrade.id)}
              disabled={!canAfford}
              className={`flex-1 ${
                canAfford
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                  : 'bg-gray-600/50 cursor-not-allowed'
              }`}
            >
              {upgrade.purchased ? 'Purchased' : 'Purchase'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ScifiUpgradeModalProps {
  upgradeId: string;
  energyCredits: number;
  onPurchase: (upgradeId: string) => void;
  onClose: () => void;
}

export const ScifiUpgradeModal: React.FC<ScifiUpgradeModalProps> = ({
  upgradeId,
  energyCredits,
  onPurchase,
  onClose
}) => {
  const upgradeCost = 50; // Base cost for energy upgrades
  const canAfford = energyCredits >= upgradeCost;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-6 w-80 mx-4 relative">
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
            ⚡ Energy Upgrade
          </h2>
          <p className="text-white/80 text-sm mt-2">
            Increase your energy generation and combat effectiveness
          </p>
        </div>

        {/* Cost and Bonus */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white/90 font-medium">Cost:</span>
            <span className="text-yellow-400 font-bold">{upgradeCost} Energy</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/90 font-medium">Bonus:</span>
            <span className="text-green-400 font-bold">+1 Mana/sec, +2 Energy/kill</span>
          </div>
        </div>

        <div className="bg-cyan-400/20 border border-cyan-400/40 rounded-lg p-3 mb-4">
          <p className="text-cyan-300 text-sm font-medium">
            ⚡ Energy Upgrade: Boosts resource generation!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-600/50 hover:bg-gray-500/50 text-white border-0"
          >
            Close
          </Button>
          <Button
            onClick={() => onPurchase(upgradeId)}
            disabled={!canAfford}
            className={`flex-1 ${
              canAfford
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-gray-600/50 cursor-not-allowed'
            }`}
          >
            {canAfford ? 'Purchase' : 'Insufficient Energy'}
          </Button>
        </div>
      </div>
    </div>
  );
};
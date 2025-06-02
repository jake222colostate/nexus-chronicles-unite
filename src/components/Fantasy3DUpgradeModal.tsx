
import React from 'react';

interface Fantasy3DUpgradeModalProps {
  upgradeName: string;
  onClose: () => void;
  onPurchase: () => void;
  upgradeData: {
    cost: number;
    manaPerSecond: number;
    unlocked: boolean;
  };
}

export const Fantasy3DUpgradeModal: React.FC<Fantasy3DUpgradeModalProps> = ({
  upgradeName,
  onClose,
  onPurchase,
  upgradeData
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 text-white shadow-2xl">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4 text-purple-300">{upgradeName}</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span>Cost:</span>
            <span className="text-yellow-400">{upgradeData.cost} Mana</span>
          </div>
          
          <div className="flex justify-between">
            <span>Bonus:</span>
            <span className="text-green-400">+{upgradeData.manaPerSecond} mana/sec</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600/80 hover:bg-gray-500/80 rounded-lg transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={onPurchase}
            disabled={upgradeData.unlocked}
            className="flex-1 px-4 py-2 bg-purple-600/80 hover:bg-purple-500/80 disabled:bg-gray-600/50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {upgradeData.unlocked ? 'Owned' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
};

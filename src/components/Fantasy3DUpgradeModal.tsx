
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
    <div 
      className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm border border-purple-400/30 rounded-xl text-white shadow-2xl"
      style={{
        width: '280px',
        maxWidth: '280px',
        height: '200px',
        maxHeight: '200px',
        boxSizing: 'border-box',
        borderRadius: '12px',
        padding: '16px'
      }}
    >
      <div className="text-center">
        <h3 className="text-sm font-bold mb-3 text-purple-300">{upgradeName}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-xs">Cost:</span>
            <span className="text-yellow-400 text-xs">{upgradeData.cost} Mana</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-xs">Bonus:</span>
            <span className="text-green-400 text-xs">+{upgradeData.manaPerSecond} mana/sec</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-600/80 hover:bg-gray-500/80 rounded-lg transition-colors min-h-[36px] text-xs"
          >
            Close
          </button>
          
          <button
            onClick={onPurchase}
            disabled={upgradeData.unlocked}
            className="flex-1 px-3 py-2 bg-purple-600/80 hover:bg-purple-500/80 disabled:bg-gray-600/50 disabled:cursor-not-allowed rounded-lg transition-colors min-h-[36px] text-xs"
          >
            {upgradeData.unlocked ? 'Owned' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
};

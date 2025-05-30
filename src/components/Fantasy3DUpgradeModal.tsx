
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Fantasy3DUpgradeModalProps {
  upgradeName: string;
  onClose: () => void;
  onPurchase?: () => void;
}

const upgradeDetails = {
  'Mana Altar': {
    description: 'Ancient stones that channel mystical energy from the earth itself.',
    cost: 50,
    effect: '+10 Mana per second',
    icon: '🔮'
  },
  'Magic Tree': {
    description: 'An enchanted tree that grows stronger with each passing moment.',
    cost: 150,
    effect: '+25 Mana per second',
    icon: '🌳'
  },
  'Arcane Lab': {
    description: 'A laboratory where magical research amplifies your power.',
    cost: 500,
    effect: '+100 Mana per second',
    icon: '⚗️'
  },
  'Crystal Tower': {
    description: 'A towering spire of crystallized magic that pierces the sky.',
    cost: 1500,
    effect: '+300 Mana per second',
    icon: '🗼'
  },
  'Dream Gate': {
    description: 'A mystical portal that opens pathways to infinite power.',
    cost: 5000,
    effect: '+1000 Mana per second',
    icon: '🌟'
  }
};

export const Fantasy3DUpgradeModal: React.FC<Fantasy3DUpgradeModalProps> = ({
  upgradeName,
  onClose,
  onPurchase
}) => {
  const upgrade = upgradeDetails[upgradeName as keyof typeof upgradeDetails];

  if (!upgrade) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-[85%] max-h-[65vh] backdrop-blur-md border-2 overflow-hidden flex flex-col bg-gradient-to-br from-purple-900/95 to-violet-800/95 border-purple-400"
        style={{
          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)'
        }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{upgrade.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-white">{upgradeName}</h2>
              <p className="text-sm text-purple-300">Mystical Upgrade</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-1 h-8 w-8 rounded-full flex-shrink-0"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-sm text-white/80">{upgrade.description}</p>
          
          {/* Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Power Bonus:</span>
              <span className="font-bold text-green-400 text-sm">
                {upgrade.effect}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Cost:</span>
              <span className="font-bold text-yellow-400 text-sm">
                {upgrade.cost} Nexus Shards
              </span>
            </div>
          </div>

          {/* 3D Model Preview Area */}
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <p className="text-white/60 text-xs">3D Model Preview</p>
            <div className="text-4xl my-2">{upgrade.icon}</div>
          </div>
        </div>

        {/* Purchase Button */}
        <div className="p-4 border-t border-white/20 flex-shrink-0">
          <Button
            onClick={onPurchase}
            className="w-full transition-all duration-300 py-3 font-bold text-sm bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white hover:scale-105 active:scale-95"
          >
            Unlock Upgrade ({upgrade.cost} Shards)
          </Button>
        </div>
      </Card>
    </div>
  );
};

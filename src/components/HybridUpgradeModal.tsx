
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, X } from 'lucide-react';

interface HybridUpgradeModalProps {
  upgrade: any;
  gameState: any;
  onPurchase: () => void;
  onClose: () => void;
}

export const HybridUpgradeModal: React.FC<HybridUpgradeModalProps> = ({
  upgrade,
  gameState,
  onPurchase,
  onClose
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const canAfford = gameState.nexusShards >= upgrade.cost;
  const isPurchased = gameState.purchasedUpgrades?.includes(upgrade.id) || false;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <Card 
        className="bg-gradient-to-br from-purple-900/95 to-cyan-900/95 border border-purple-400/50 relative backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden flex flex-col"
        style={{
          maxWidth: '90vw',
          width: '100%',
          maxHeight: '70vh',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          borderRadius: '12px'
        }}
      >
        {/* Enhanced glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-xl" />
        
        <div className="p-5 relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{upgrade.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-white">{upgrade.name}</h3>
                <div className="text-yellow-400 text-sm flex items-center gap-1">
                  <Crown size={12} />
                  Tier {upgrade.tier}
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/15 p-1 h-8 w-8 rounded-full flex-shrink-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Scrollable content */}
          <div 
            className="flex-1 overflow-y-auto scrollbar-hide space-y-4"
            style={{
              maxHeight: 'calc(70vh - 200px)',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {/* Description */}
            <p className="text-white/80 leading-relaxed text-sm">{upgrade.description}</p>

            {/* Effects */}
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm">Effects:</h4>
              {upgrade.effects.globalProductionBonus && (
                <div className="text-green-300 text-sm flex items-center gap-2">
                  <span>📈</span>
                  +{(upgrade.effects.globalProductionBonus * 100).toFixed(0)}% Global Production
                </div>
              )}
              {upgrade.effects.manaProductionBonus && (
                <div className="text-purple-300 text-sm flex items-center gap-2">
                  <span>🔮</span>
                  +{upgrade.effects.manaProductionBonus} Mana/sec
                </div>
              )}
              {upgrade.effects.energyProductionBonus && (
                <div className="text-cyan-300 text-sm flex items-center gap-2">
                  <span>⚡</span>
                  +{upgrade.effects.energyProductionBonus} Energy/sec
                </div>
              )}
            </div>

            {/* Requirements */}
            {Object.keys(upgrade.requirements).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Requirements:</h4>
                {upgrade.requirements.mana && (
                  <div className="text-purple-300 text-sm">
                    🔮 {formatNumber(upgrade.requirements.mana)} Mana
                  </div>
                )}
                {upgrade.requirements.energy && (
                  <div className="text-cyan-300 text-sm">
                    ⚡ {formatNumber(upgrade.requirements.energy)} Energy
                  </div>
                )}
                {upgrade.requirements.convergenceCount && (
                  <div className="text-orange-300 text-sm">
                    🌌 {upgrade.requirements.convergenceCount} Convergences
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cost and Purchase - Fixed at bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20 flex-shrink-0">
            <div className="text-yellow-400 font-bold flex items-center gap-2 text-sm">
              <Crown size={16} />
              {formatNumber(upgrade.cost)} Nexus Shards
            </div>
            
            {isPurchased ? (
              <div className="text-green-400 font-semibold flex items-center gap-2 text-sm">
                <Crown size={14} />
                Purchased
              </div>
            ) : (
              <Button
                onClick={onPurchase}
                disabled={!canAfford}
                size="sm"
                className={`${
                  canAfford
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                    : 'bg-gray-600'
                } text-white`}
              >
                <Crown className="mr-1" size={14} />
                Purchase
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

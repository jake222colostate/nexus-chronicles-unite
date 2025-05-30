
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

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <Card 
        className="w-full max-w-[340px] max-h-[80vh] bg-gradient-to-br from-purple-900/95 to-cyan-900/95 border border-purple-400/50 relative backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden animate-scale-in"
        style={{
          filter: 'drop-shadow(0 8px 32px rgba(168, 85, 247, 0.4))'
        }}
        onClick={handleModalClick}
      >
        
        {/* Enhanced glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-xl" />
        
        {/* Scrollable content */}
        <div className="p-5 relative z-10 overflow-y-auto max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl drop-shadow-sm">{upgrade.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-white drop-shadow-sm leading-tight">{upgrade.name}</h3>
                <div className="text-yellow-400 text-sm flex items-center gap-1 mt-1">
                  <Crown size={12} />
                  <span className="drop-shadow-sm font-semibold">Tier {upgrade.tier}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/15 p-1 h-8 w-8 rounded-full shadow-md flex-shrink-0"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
              }}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Description */}
          <p className="text-white/90 mb-5 leading-relaxed text-sm drop-shadow-sm">{upgrade.description}</p>

          {/* Effects */}
          <div className="space-y-2 mb-5">
            <h4 className="text-white font-bold mb-3 text-sm drop-shadow-sm">Effects:</h4>
            {upgrade.effects.globalProductionBonus && (
              <div className="text-green-300 text-sm flex items-center gap-2 drop-shadow-sm font-semibold">
                <span>📈</span>
                +{(upgrade.effects.globalProductionBonus * 100).toFixed(0)}% Global Production
              </div>
            )}
            {upgrade.effects.manaProductionBonus && (
              <div className="text-purple-300 text-sm flex items-center gap-2 drop-shadow-sm font-semibold">
                <span>🔮</span>
                +{upgrade.effects.manaProductionBonus} Mana/sec
              </div>
            )}
            {upgrade.effects.energyProductionBonus && (
              <div className="text-cyan-300 text-sm flex items-center gap-2 drop-shadow-sm font-semibold">
                <span>⚡</span>
                +{upgrade.effects.energyProductionBonus} Energy/sec
              </div>
            )}
          </div>

          {/* Requirements */}
          {Object.keys(upgrade.requirements).length > 0 && (
            <div className="space-y-2 mb-5">
              <h4 className="text-white font-bold text-sm drop-shadow-sm">Requirements:</h4>
              {upgrade.requirements.mana && (
                <div className="text-purple-300 text-sm drop-shadow-sm font-semibold">
                  🔮 {formatNumber(upgrade.requirements.mana)} Mana
                </div>
              )}
              {upgrade.requirements.energy && (
                <div className="text-cyan-300 text-sm drop-shadow-sm font-semibold">
                  ⚡ {formatNumber(upgrade.requirements.energy)} Energy
                </div>
              )}
              {upgrade.requirements.convergenceCount && (
                <div className="text-orange-300 text-sm drop-shadow-sm font-semibold">
                  🌌 {upgrade.requirements.convergenceCount} Convergences
                </div>
              )}
            </div>
          )}

          {/* Cost and Purchase */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="text-yellow-400 font-bold flex items-center gap-2 text-sm drop-shadow-sm">
              <Crown size={16} />
              {formatNumber(upgrade.cost)} Nexus Shards
            </div>
            
            {isPurchased ? (
              <div className="text-green-400 font-bold flex items-center gap-2 text-sm drop-shadow-sm">
                <Crown size={14} />
                Purchased
              </div>
            ) : (
              <Button
                onClick={onPurchase}
                disabled={!canAfford}
                className={`text-sm px-4 py-2 rounded-lg transition-all duration-300 shadow-lg font-bold ${
                  canAfford
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 hover:scale-105'
                    : 'bg-gray-600 opacity-60'
                } text-white`}
                style={{
                  filter: canAfford 
                    ? 'drop-shadow(0 4px 16px rgba(168, 85, 247, 0.4))'
                    : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))'
                }}
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

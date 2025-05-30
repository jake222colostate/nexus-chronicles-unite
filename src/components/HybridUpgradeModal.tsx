
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
    <Card className="w-full bg-gradient-to-br from-purple-900/95 to-cyan-900/95 border border-purple-400/50 relative backdrop-blur-xl shadow-2xl rounded-xl">
      {/* Enhanced glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-xl" />
      
      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{upgrade.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-white">{upgrade.name}</h3>
              <div className="text-yellow-400 text-sm flex items-center gap-1">
                <Crown size={14} />
                Tier {upgrade.tier}
              </div>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/15 p-1 h-8 w-8 rounded-full"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Description */}
        <p className="text-white/80 mb-6 leading-relaxed">{upgrade.description}</p>

        {/* Effects */}
        <div className="space-y-3 mb-6">
          <h4 className="text-white font-semibold mb-2">Effects:</h4>
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
          <div className="space-y-2 mb-6">
            <h4 className="text-white font-semibold">Requirements:</h4>
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

        {/* Cost and Purchase */}
        <div className="flex items-center justify-between">
          <div className="text-yellow-400 font-bold flex items-center gap-2">
            <Crown size={18} />
            {formatNumber(upgrade.cost)} Nexus Shards
          </div>
          
          {isPurchased ? (
            <div className="text-green-400 font-semibold flex items-center gap-2">
              <Crown size={16} />
              Purchased
            </div>
          ) : (
            <Button
              onClick={onPurchase}
              disabled={!canAfford}
              className={`${
                canAfford
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                  : 'bg-gray-600'
              } text-white`}
            >
              <Crown className="mr-2" size={16} />
              Purchase
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

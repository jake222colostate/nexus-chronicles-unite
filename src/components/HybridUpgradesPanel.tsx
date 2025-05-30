
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { HybridUpgrade } from '../types/GameTypes';
import { hybridUpgrades } from '../data/HybridUpgrades';

interface HybridUpgradesPanelProps {
  gameState: any;
  onPurchaseUpgrade: (upgradeId: string) => void;
}

export const HybridUpgradesPanel: React.FC<HybridUpgradesPanelProps> = ({
  gameState,
  onPurchaseUpgrade
}) => {
  const checkUpgradeUnlocked = (upgrade: HybridUpgrade): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && gameState.mana < requirements.mana) return false;
    if (requirements.energy && gameState.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  };

  const canAffordUpgrade = (upgrade: HybridUpgrade): boolean => {
    return gameState.nexusShards >= upgrade.cost;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const getUnlockedUpgrades = () => {
    return hybridUpgrades.filter(upgrade => checkUpgradeUnlocked(upgrade));
  };

  const getPurchasedUpgrades = () => {
    return gameState.purchasedUpgrades || [];
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-400" />
          Hybrid Nexus
          <Sparkles className="text-yellow-400" />
        </h2>
        <p className="text-white/80 text-sm">
          Fusion technologies that transcend realm boundaries
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Crown className="text-yellow-400" size={20} />
        <span className="text-yellow-400 font-bold text-lg">
          {formatNumber(gameState.nexusShards)} Nexus Shards
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {hybridUpgrades.map((upgrade) => {
          const isUnlocked = checkUpgradeUnlocked(upgrade);
          const isPurchased = getPurchasedUpgrades().includes(upgrade.id);
          const canAfford = canAffordUpgrade(upgrade);

          return (
            <Card
              key={upgrade.id}
              className={`p-4 transition-all duration-300 ${
                isPurchased
                  ? 'bg-green-800/40 border-green-400'
                  : isUnlocked
                  ? 'bg-gradient-to-r from-purple-800/40 to-cyan-800/40 border-purple-400'
                  : 'bg-gray-800/40 border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{upgrade.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white">{upgrade.name}</h3>
                    {!isUnlocked && <Lock size={16} className="text-gray-400" />}
                    {isPurchased && <Crown size={16} className="text-yellow-400" />}
                  </div>
                  
                  <p className="text-white/80 text-sm mb-3">{upgrade.description}</p>
                  
                  {/* Effects Display */}
                  <div className="space-y-1 mb-3">
                    {upgrade.effects.globalProductionBonus && (
                      <div className="text-xs text-green-300">
                        +{(upgrade.effects.globalProductionBonus * 100).toFixed(0)}% Global Production
                      </div>
                    )}
                    {upgrade.effects.manaProductionBonus && (
                      <div className="text-xs text-purple-300">
                        +{upgrade.effects.manaProductionBonus} Mana/sec
                      </div>
                    )}
                    {upgrade.effects.energyProductionBonus && (
                      <div className="text-xs text-cyan-300">
                        +{upgrade.effects.energyProductionBonus} Energy/sec
                      </div>
                    )}
                  </div>

                  {/* Requirements Display */}
                  {!isUnlocked && (
                    <div className="space-y-1 mb-3 p-2 bg-black/30 rounded text-xs">
                      <div className="text-yellow-300 font-bold">Requirements:</div>
                      {upgrade.requirements.mana && (
                        <div className={gameState.mana >= upgrade.requirements.mana ? 'text-green-300' : 'text-red-300'}>
                          Mana: {formatNumber(upgrade.requirements.mana)}
                        </div>
                      )}
                      {upgrade.requirements.energy && (
                        <div className={gameState.energyCredits >= upgrade.requirements.energy ? 'text-green-300' : 'text-red-300'}>
                          Energy: {formatNumber(upgrade.requirements.energy)}
                        </div>
                      )}
                      {upgrade.requirements.nexusShards && (
                        <div className={gameState.nexusShards >= upgrade.requirements.nexusShards ? 'text-green-300' : 'text-red-300'}>
                          Nexus Shards: {upgrade.requirements.nexusShards}
                        </div>
                      )}
                      {upgrade.requirements.convergenceCount && (
                        <div className={gameState.convergenceCount >= upgrade.requirements.convergenceCount ? 'text-green-300' : 'text-red-300'}>
                          Convergences: {upgrade.requirements.convergenceCount}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Purchase Button */}
                  {isUnlocked && !isPurchased && (
                    <Button
                      onClick={() => onPurchaseUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      size="sm"
                      className={`w-full ${
                        canAfford
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                          : 'bg-gray-600'
                      }`}
                    >
                      <Crown className="mr-2" size={14} />
                      Purchase ({upgrade.cost} Shards)
                    </Button>
                  )}

                  {isPurchased && (
                    <div className="text-center text-green-400 font-bold text-sm">
                      ✅ Purchased
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, X, Lock } from 'lucide-react';

export interface NexusShardUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  effects: {
    manaBonus?: number;
    energyBonus?: number;
    globalProductionBonus?: number;
  };
  purchased: boolean;
  unlockRequirement?: {
    fantasySpecial: boolean;
    scifiSpecial: boolean;
  };
}

interface NexusShardShopProps {
  upgrades: NexusShardUpgrade[];
  nexusShards: number;
  hasFantasySpecial: boolean;
  hasScifiSpecial: boolean;
  onPurchase: (upgradeId: string) => void;
  onClose: () => void;
}

export const NexusShardShop: React.FC<NexusShardShopProps> = ({
  upgrades,
  nexusShards,
  hasFantasySpecial,
  hasScifiSpecial,
  onPurchase,
  onClose
}) => {
  const isUnlocked = (upgrade: NexusShardUpgrade): boolean => {
    if (!upgrade.unlockRequirement) return true;
    
    const { fantasySpecial, scifiSpecial } = upgrade.unlockRequirement;
    return (!fantasySpecial || hasFantasySpecial) && (!scifiSpecial || hasScifiSpecial);
  };

  const canAfford = (upgrade: NexusShardUpgrade): boolean => {
    return nexusShards >= upgrade.cost && !upgrade.purchased && isUnlocked(upgrade);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-violet-800/95 backdrop-blur-xl rounded-xl border border-yellow-400/30 overflow-hidden max-w-md w-full max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="text-yellow-400" />
            Nexus Shard Shop
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

        {/* Nexus Shards Display */}
        <div className="p-4 bg-black/30 border-b border-yellow-400/20">
          <div className="flex items-center justify-center gap-2">
            <Crown className="text-yellow-400" size={20} />
            <span className="text-yellow-400 font-bold text-lg">
              {nexusShards} Nexus Shards
            </span>
          </div>
        </div>

        {/* Upgrades List */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-96">
          {upgrades.map(upgrade => {
            const unlocked = isUnlocked(upgrade);
            const affordable = canAfford(upgrade);

            return (
              <div
                key={upgrade.id}
                className={`bg-black/40 rounded-lg p-4 border transition-all duration-200 ${
                  unlocked 
                    ? 'border-yellow-400/20 hover:border-yellow-400/40' 
                    : 'border-gray-600/40 bg-gray-800/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <span className="text-2xl">{upgrade.icon}</span>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {upgrade.name}
                    </h3>
                    <p className={`text-sm ${unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                      {upgrade.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                      <Crown size={14} className="inline mr-1" />
                      {upgrade.cost}
                    </div>
                  </div>
                </div>

                {/* Unlock Requirements */}
                {!unlocked && upgrade.unlockRequirement && (
                  <div className="mb-3 text-xs text-red-300 bg-red-900/30 rounded p-2 border border-red-400/30">
                    <Lock size={10} className="inline mr-1" />
                    Requires special upgrades from both worlds
                  </div>
                )}

                {/* Effects */}
                {unlocked && (
                  <div className="mb-3 space-y-1">
                    {upgrade.effects.manaBonus && (
                      <div className="text-xs text-purple-300">
                        +{upgrade.effects.manaBonus} Mana/sec (both worlds)
                      </div>
                    )}
                    {upgrade.effects.energyBonus && (
                      <div className="text-xs text-cyan-300">
                        +{upgrade.effects.energyBonus} Energy/sec (both worlds)
                      </div>
                    )}
                    {upgrade.effects.globalProductionBonus && (
                      <div className="text-xs text-green-300">
                        +{(upgrade.effects.globalProductionBonus * 100).toFixed(0)}% Global Production
                      </div>
                    )}
                  </div>
                )}

                {/* Purchase Button */}
                <Button
                  onClick={() => onPurchase(upgrade.id)}
                  disabled={!affordable || upgrade.purchased}
                  className={`w-full h-8 text-xs ${
                    upgrade.purchased
                      ? 'bg-green-600/50 text-green-300 cursor-not-allowed'
                      : !unlocked
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : affordable
                      ? 'bg-gradient-to-r from-purple-600 to-yellow-600 hover:from-purple-700 hover:to-yellow-700'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {upgrade.purchased 
                    ? 'Purchased' 
                    : !unlocked 
                    ? 'Locked'
                    : `Purchase (${upgrade.cost} Shards)`
                  }
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

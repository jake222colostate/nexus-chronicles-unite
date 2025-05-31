
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ChevronDown, Crown, Lock, X } from 'lucide-react';

interface ScrollableUpgradePanelProps {
  upgrades: any[];
  currentRealm: 'fantasy' | 'scifi';
  gameState: any;
  onUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

export const ScrollableUpgradePanel: React.FC<ScrollableUpgradePanelProps> = ({
  upgrades,
  currentRealm,
  gameState,
  onUpgrade,
  onClose
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkUpgradeUnlocked = (upgrade: any): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && gameState.mana < requirements.mana) return false;
    if (requirements.energy && gameState.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  };

  const canAfford = (upgrade: any): boolean => {
    return gameState.nexusShards >= upgrade.cost;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -200, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
    }
  };

  // Group upgrades by tier
  const upgradesByTier = upgrades.reduce((acc, upgrade) => {
    if (!acc[upgrade.tier]) acc[upgrade.tier] = [];
    acc[upgrade.tier].push(upgrade);
    return acc;
  }, {} as { [key: number]: any[] });

  const selectedUpgradeData = selectedUpgrade ? upgrades.find(u => u.id === selectedUpgrade) : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/95 to-violet-800/95 backdrop-blur-xl rounded-xl border border-purple-400/30 w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {currentRealm === 'fantasy' ? '🏰' : '🚀'} {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'} Upgrades
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
        <div className="flex items-center justify-center gap-2 p-3 border-b border-purple-400/20">
          <Crown className="text-yellow-400" size={20} />
          <span className="text-yellow-400 font-bold text-lg">
            {formatNumber(gameState.nexusShards)} Nexus Shards
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex h-[60vh]">
          {/* Scrollable Upgrades List */}
          <div className="flex-1 relative">
            {/* Scroll Controls */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
              <Button
                onClick={scrollUp}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <ChevronUp size={16} />
              </Button>
              <Button
                onClick={scrollDown}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <ChevronDown size={16} />
              </Button>
            </div>

            <ScrollArea className="h-full">
              <div ref={scrollRef} className="p-4 space-y-6">
                {Object.keys(upgradesByTier).sort((a, b) => Number(a) - Number(b)).map(tier => (
                  <div key={tier} className="space-y-3">
                    <h3 className="text-lg font-bold text-white border-b border-purple-400/30 pb-2">
                      Tier {tier}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {upgradesByTier[Number(tier)].map(upgrade => {
                        const unlocked = checkUpgradeUnlocked(upgrade);
                        const affordable = canAfford(upgrade);
                        const purchased = gameState.purchasedUpgrades?.includes(upgrade.id) || false;

                        return (
                          <div
                            key={upgrade.id}
                            className={`relative bg-black/40 rounded-lg p-3 border cursor-pointer transition-all duration-200 ${
                              selectedUpgrade === upgrade.id
                                ? 'border-purple-400 bg-purple-900/20'
                                : unlocked 
                                ? 'border-purple-400/20 hover:border-purple-400/40' 
                                : 'border-gray-600/40 bg-gray-800/60'
                            }`}
                            onClick={() => setSelectedUpgrade(upgrade.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative">
                                <span className="text-2xl">{upgrade.icon}</span>
                                {purchased && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Crown size={8} className="text-white" />
                                  </div>
                                )}
                                {!unlocked && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                                    <Lock size={8} className="text-white" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-gray-400'}`}>
                                  {upgrade.name}
                                </h4>
                                <p className={`text-xs mt-1 ${unlocked ? 'text-purple-300' : 'text-gray-500'}`}>
                                  {upgrade.description}
                                </p>
                                <div className="text-xs text-yellow-400 mt-1">
                                  Cost: {upgrade.cost} Shards
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Upgrade Details */}
          {selectedUpgradeData && (
            <div className="w-80 border-l border-purple-400/20 p-4 bg-black/30">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedUpgradeData.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{selectedUpgradeData.name}</h3>
                    <div className="text-yellow-400 text-sm">Tier {selectedUpgradeData.tier}</div>
                  </div>
                </div>
                
                <p className="text-white/80 text-sm">{selectedUpgradeData.description}</p>
                
                {/* Effects */}
                <div className="space-y-2">
                  <h4 className="text-white font-semibold text-sm">Effects:</h4>
                  {selectedUpgradeData.effects.globalProductionBonus && (
                    <div className="text-xs text-green-300">
                      +{(selectedUpgradeData.effects.globalProductionBonus * 100).toFixed(0)}% Global Production
                    </div>
                  )}
                  {selectedUpgradeData.effects.energyProductionBonus && (
                    <div className="text-xs text-cyan-300">
                      +{selectedUpgradeData.effects.energyProductionBonus} Energy/sec
                    </div>
                  )}
                  {selectedUpgradeData.effects.manaProductionBonus && (
                    <div className="text-xs text-purple-300">
                      +{selectedUpgradeData.effects.manaProductionBonus} Mana/sec
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {selectedUpgradeData.requirements && (
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Requirements:</h4>
                    <div className="text-xs space-y-1">
                      {selectedUpgradeData.requirements.energy && (
                        <div className={gameState.energyCredits >= selectedUpgradeData.requirements.energy ? 'text-green-300' : 'text-red-300'}>
                          Energy: {formatNumber(selectedUpgradeData.requirements.energy)}
                        </div>
                      )}
                      {selectedUpgradeData.requirements.nexusShards && (
                        <div className={gameState.nexusShards >= selectedUpgradeData.requirements.nexusShards ? 'text-green-300' : 'text-red-300'}>
                          Nexus Shards: {selectedUpgradeData.requirements.nexusShards}
                        </div>
                      )}
                      {selectedUpgradeData.requirements.convergenceCount && (
                        <div className={gameState.convergenceCount >= selectedUpgradeData.requirements.convergenceCount ? 'text-green-300' : 'text-red-300'}>
                          Convergences: {selectedUpgradeData.requirements.convergenceCount}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                {checkUpgradeUnlocked(selectedUpgradeData) && !gameState.purchasedUpgrades?.includes(selectedUpgradeData.id) && (
                  <Button
                    onClick={() => {
                      onUpgrade(selectedUpgradeData.id);
                      setSelectedUpgrade(null);
                    }}
                    disabled={!canAfford(selectedUpgradeData)}
                    className={`w-full ${
                      canAfford(selectedUpgradeData)
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                        : 'bg-gray-600'
                    }`}
                  >
                    <Crown className="mr-2" size={14} />
                    Purchase ({selectedUpgradeData.cost} Shards)
                  </Button>
                )}
                
                {gameState.purchasedUpgrades?.includes(selectedUpgradeData.id) && (
                  <div className="text-green-400 text-center py-2 font-semibold">
                    ✅ Purchased
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

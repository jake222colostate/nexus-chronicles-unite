
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles, X } from 'lucide-react';
import { HybridUpgrade } from '../types/GameTypes';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';

interface SkillTreeUpgradesPanelProps {
  gameState: any;
  onPurchaseUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

export const SkillTreeUpgradesPanel: React.FC<SkillTreeUpgradesPanelProps> = ({
  gameState,
  onPurchaseUpgrade,
  onClose
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);

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
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const getPurchasedUpgrades = () => {
    return gameState.purchasedUpgrades || [];
  };

  // Organize upgrades by tier for skill tree layout
  const upgradesByTier = {
    1: enhancedHybridUpgrades.filter(u => u.tier === 1),
    2: enhancedHybridUpgrades.filter(u => u.tier === 2),
    3: enhancedHybridUpgrades.filter(u => u.tier === 3),
    4: enhancedHybridUpgrades.filter(u => u.tier === 4)
  };

  const UpgradeNode: React.FC<{ upgrade: HybridUpgrade; position: { x: number; y: number } }> = ({ upgrade, position }) => {
    const isUnlocked = checkUpgradeUnlocked(upgrade);
    const isPurchased = getPurchasedUpgrades().includes(upgrade.id);
    const canAfford = canAffordUpgrade(upgrade);

    return (
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
        onClick={() => setSelectedUpgrade(upgrade.id)}
      >
        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 ${
          isPurchased
            ? 'bg-green-600/80 border-green-400 shadow-green-400/30'
            : isUnlocked
            ? 'bg-gradient-to-br from-purple-600/80 to-cyan-600/80 border-purple-400 shadow-purple-400/30'
            : 'bg-gray-700/80 border-gray-500 opacity-60'
        } shadow-lg backdrop-blur-sm`}>
          {upgrade.icon}
        </div>
        
        {isPurchased && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Crown size={10} className="text-white" />
          </div>
        )}
        
        {!isUnlocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
            <Lock size={10} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  const selectedUpgradeData = selectedUpgrade ? enhancedHybridUpgrades.find(u => u.id === selectedUpgrade) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="text-yellow-400" />
          Nexus Skill Tree
        </h2>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/15 p-1 h-8 w-8 rounded-full"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Nexus Shards Display */}
      <div className="flex items-center justify-center gap-2 p-3 border-b border-white/20 flex-shrink-0">
        <Crown className="text-yellow-400" size={20} />
        <span className="text-yellow-400 font-bold text-lg">
          {formatNumber(gameState.nexusShards)} Nexus Shards
        </span>
      </div>

      {/* Skill Tree Container */}
      <div className="flex-1 relative overflow-auto p-4">
        <div className="relative min-h-[400px]">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Tier 1 to Tier 2 connections */}
            <line x1="50%" y1="15%" x2="30%" y2="35%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <line x1="50%" y1="15%" x2="70%" y2="35%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            
            {/* Tier 2 to Tier 3 connections */}
            <line x1="30%" y1="35%" x2="25%" y2="65%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <line x1="30%" y1="35%" x2="50%" y2="65%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <line x1="70%" y1="35%" x2="50%" y2="65%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            <line x1="70%" y1="35%" x2="75%" y2="65%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
            
            {/* Tier 3 to Tier 4 connections */}
            <line x1="50%" y1="65%" x2="50%" y2="85%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
          </svg>

          {/* Tier 1 - Top */}
          {upgradesByTier[1].map((upgrade, index) => (
            <UpgradeNode 
              key={upgrade.id} 
              upgrade={upgrade} 
              position={{ x: 50, y: 15 }} 
            />
          ))}

          {/* Tier 2 - Second Row */}
          {upgradesByTier[2].map((upgrade, index) => (
            <UpgradeNode 
              key={upgrade.id} 
              upgrade={upgrade} 
              position={{ x: 30 + (index * 40), y: 35 }} 
            />
          ))}

          {/* Tier 3 - Third Row */}
          {upgradesByTier[3].map((upgrade, index) => (
            <UpgradeNode 
              key={upgrade.id} 
              upgrade={upgrade} 
              position={{ x: 25 + (index * 25), y: 65 }} 
            />
          ))}

          {/* Tier 4 - Bottom */}
          {upgradesByTier[4].map((upgrade, index) => (
            <UpgradeNode 
              key={upgrade.id} 
              upgrade={upgrade} 
              position={{ x: 50, y: 85 }} 
            />
          ))}
        </div>
      </div>

      {/* Selected Upgrade Details */}
      {selectedUpgradeData && (
        <div className="border-t border-white/20 p-4 bg-black/30 flex-shrink-0">
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-xl">{selectedUpgradeData.icon}</span>
              {selectedUpgradeData.name}
            </h3>
            <p className="text-white/80 text-sm">{selectedUpgradeData.description}</p>
            
            {/* Effects */}
            <div className="space-y-1">
              {selectedUpgradeData.effects.globalProductionBonus && (
                <div className="text-xs text-green-300">
                  +{(selectedUpgradeData.effects.globalProductionBonus * 100).toFixed(0)}% Global Production
                </div>
              )}
              {selectedUpgradeData.effects.manaProductionBonus && (
                <div className="text-xs text-purple-300">
                  +{selectedUpgradeData.effects.manaProductionBonus} Mana/sec
                </div>
              )}
              {selectedUpgradeData.effects.energyProductionBonus && (
                <div className="text-xs text-cyan-300">
                  +{selectedUpgradeData.effects.energyProductionBonus} Energy/sec
                </div>
              )}
            </div>

            {/* Purchase Button */}
            {checkUpgradeUnlocked(selectedUpgradeData) && !getPurchasedUpgrades().includes(selectedUpgradeData.id) && (
              <Button
                onClick={() => {
                  onPurchaseUpgrade(selectedUpgradeData.id);
                  setSelectedUpgrade(null);
                }}
                disabled={!canAffordUpgrade(selectedUpgradeData)}
                size="sm"
                className={`w-full ${
                  canAffordUpgrade(selectedUpgradeData)
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                    : 'bg-gray-600'
                }`}
              >
                <Crown className="mr-2" size={14} />
                Purchase ({selectedUpgradeData.cost} Shards)
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

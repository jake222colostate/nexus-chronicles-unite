
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Lock } from 'lucide-react';

export interface CrossRealmUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  realm: 'fantasy' | 'scifi';
  level: number;
  maxLevel: number;
  baseCost: number;
  effect: {
    damage?: number;
    fireRate?: number;
    range?: number;
    manaPerSecond?: number;
    energyPerSecond?: number;
  };
  unlockRequirement?: {
    otherRealm: 'fantasy' | 'scifi';
    journeyDistance: number;
  };
}

interface CrossRealmUpgradeSystemProps {
  upgrades: CrossRealmUpgrade[];
  currentRealm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  fantasyJourneyDistance: number;
  scifiJourneyDistance: number;
  onUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

export const CrossRealmUpgradeSystem: React.FC<CrossRealmUpgradeSystemProps> = ({
  upgrades,
  currentRealm,
  mana,
  energyCredits,
  fantasyJourneyDistance,
  scifiJourneyDistance,
  onUpgrade,
  onClose
}) => {
  const calculateCost = (upgrade: CrossRealmUpgrade): number => {
    return Math.floor(upgrade.baseCost * Math.pow(1.6, upgrade.level));
  };

  const isUpgradeUnlocked = (upgrade: CrossRealmUpgrade): boolean => {
    if (!upgrade.unlockRequirement) return true;
    
    const requiredDistance = upgrade.unlockRequirement.journeyDistance;
    const otherRealmDistance = upgrade.unlockRequirement.otherRealm === 'fantasy' 
      ? fantasyJourneyDistance 
      : scifiJourneyDistance;
    
    return otherRealmDistance >= requiredDistance;
  };

  const canAfford = (upgrade: CrossRealmUpgrade): boolean => {
    const cost = calculateCost(upgrade);
    const currency = currentRealm === 'fantasy' ? mana : energyCredits;
    return currency >= cost && upgrade.level < upgrade.maxLevel && isUpgradeUnlocked(upgrade);
  };

  const realmUpgrades = upgrades.filter(upgrade => upgrade.realm === currentRealm);

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
      <div 
        className="bg-gradient-to-br from-purple-900/95 to-violet-800/95 backdrop-blur-xl rounded-xl border border-purple-400/30 overflow-hidden"
        style={{
          maxWidth: '90vw',
          width: '100%',
          maxHeight: '70vh',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          borderRadius: '12px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏰 {currentRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'} Upgrades
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

        {/* Upgrades List */}
        <div 
          className="p-4 space-y-3 overflow-y-auto"
          style={{
            maxHeight: 'calc(70vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {realmUpgrades.map(upgrade => {
            const cost = calculateCost(upgrade);
            const affordable = canAfford(upgrade);
            const unlocked = isUpgradeUnlocked(upgrade);
            const maxed = upgrade.level >= upgrade.maxLevel;

            return (
              <div
                key={upgrade.id}
                className={`bg-black/40 rounded-lg p-4 border transition-all duration-200 ${
                  unlocked 
                    ? 'border-purple-400/20 hover:border-purple-400/40' 
                    : 'border-gray-600/40 bg-gray-800/60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-2xl">{upgrade.icon}</span>
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-gray-400'}`}>
                        {upgrade.name}
                      </h3>
                      <p className={`text-xs ${unlocked ? 'text-purple-300' : 'text-gray-500'}`}>
                        {upgrade.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                      Level {upgrade.level}/{upgrade.maxLevel}
                    </div>
                  </div>
                </div>

                {/* Unlock Requirement */}
                {!unlocked && upgrade.unlockRequirement && (
                  <div className="mb-3 text-xs text-red-300 bg-red-900/30 rounded p-2 border border-red-400/30">
                    <Lock size={12} className="inline mr-1" />
                    Unlockable at {upgrade.unlockRequirement.journeyDistance}m in{' '}
                    {upgrade.unlockRequirement.otherRealm === 'fantasy' ? 'Fantasy' : 'Sci-Fi'} realm
                  </div>
                )}

                {/* Effect Display */}
                {unlocked && (
                  <div className="mb-3 text-xs text-purple-200">
                    {upgrade.effect.damage && (
                      <div>Damage: +{upgrade.effect.damage * (upgrade.level + 1)}</div>
                    )}
                    {upgrade.effect.fireRate && (
                      <div>Fire Rate: -{upgrade.effect.fireRate * (upgrade.level + 1)}ms</div>
                    )}
                    {upgrade.effect.range && (
                      <div>Range: +{upgrade.effect.range * (upgrade.level + 1)}m</div>
                    )}
                    {upgrade.effect.manaPerSecond && (
                      <div>Mana/sec: +{upgrade.effect.manaPerSecond * (upgrade.level + 1)}</div>
                    )}
                    {upgrade.effect.energyPerSecond && (
                      <div>Energy/sec: +{upgrade.effect.energyPerSecond * (upgrade.level + 1)}</div>
                    )}
                  </div>
                )}

                {/* Upgrade Button */}
                <Button
                  onClick={() => onUpgrade(upgrade.id)}
                  disabled={!affordable || maxed || !unlocked}
                  className={`w-full h-8 text-sm ${
                    maxed
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : !unlocked
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : affordable
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {maxed 
                    ? 'MAX LEVEL' 
                    : !unlocked 
                    ? 'LOCKED'
                    : `Upgrade (${cost} ${currentRealm === 'fantasy' ? 'Mana' : 'Energy'})`
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

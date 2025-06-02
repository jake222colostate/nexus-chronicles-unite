
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface WeaponUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  effect: {
    damage?: number;
    fireRate?: number;
    range?: number;
  };
}

interface WeaponUpgradeSystemProps {
  upgrades: WeaponUpgrade[];
  mana: number;
  onUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

export const WeaponUpgradeSystem: React.FC<WeaponUpgradeSystemProps> = ({
  upgrades,
  mana,
  onUpgrade,
  onClose
}) => {
  const calculateCost = (upgrade: WeaponUpgrade): number => {
    return Math.floor(upgrade.baseCost * Math.pow(1.8, upgrade.level));
  };

  const canAfford = (upgrade: WeaponUpgrade): boolean => {
    return mana >= calculateCost(upgrade) && upgrade.level < upgrade.maxLevel;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="bg-gradient-to-br from-purple-900/95 to-violet-800/95 backdrop-blur-xl rounded-xl border border-purple-400/30 overflow-hidden"
        style={{
          width: '320px',
          maxWidth: '320px',
          height: '450px',
          maxHeight: '450px',
          boxSizing: 'border-box',
          borderRadius: '12px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-purple-400/20 flex-shrink-0">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            🏹 Weapon Upgrades
          </h2>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={12} />
          </Button>
        </div>

        {/* Upgrades List */}
        <div 
          className="p-3 space-y-2"
          style={{
            height: '400px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {upgrades.map(upgrade => {
            const cost = calculateCost(upgrade);
            const affordable = canAfford(upgrade);
            const maxed = upgrade.level >= upgrade.maxLevel;

            return (
              <div
                key={upgrade.id}
                className="bg-black/40 rounded-lg p-3 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{upgrade.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white text-xs">{upgrade.name}</h3>
                      <p className="text-purple-300 text-xs">{upgrade.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-xs">
                      Level {upgrade.level}/{upgrade.maxLevel}
                    </div>
                  </div>
                </div>

                {/* Effect Display */}
                <div className="mb-2 text-xs text-purple-200">
                  {upgrade.effect.damage && (
                    <div>Damage: +{upgrade.effect.damage * upgrade.level}</div>
                  )}
                  {upgrade.effect.fireRate && (
                    <div>Fire Rate: -{upgrade.effect.fireRate * upgrade.level}ms</div>
                  )}
                  {upgrade.effect.range && (
                    <div>Range: +{upgrade.effect.range * upgrade.level}m</div>
                  )}
                </div>

                {/* Upgrade Button */}
                <Button
                  onClick={() => onUpgrade(upgrade.id)}
                  disabled={!affordable || maxed}
                  className={`w-full h-7 text-xs ${
                    maxed
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : affordable
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {maxed ? 'MAX LEVEL' : `Upgrade (${cost} Mana)`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

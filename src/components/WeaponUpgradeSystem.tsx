
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/95 to-violet-800/95 backdrop-blur-xl rounded-xl border border-purple-400/30 w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏹 Weapon Upgrades
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
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {upgrades.map(upgrade => {
            const cost = calculateCost(upgrade);
            const affordable = canAfford(upgrade);
            const maxed = upgrade.level >= upgrade.maxLevel;

            return (
              <div
                key={upgrade.id}
                className="bg-black/40 rounded-lg p-4 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{upgrade.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{upgrade.name}</h3>
                      <p className="text-purple-300 text-xs">{upgrade.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-sm">
                      Level {upgrade.level}/{upgrade.maxLevel}
                    </div>
                  </div>
                </div>

                {/* Effect Display */}
                <div className="mb-3 text-xs text-purple-200">
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
                  className={`w-full h-8 text-sm ${
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

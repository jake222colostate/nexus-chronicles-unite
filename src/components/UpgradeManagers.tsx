
import { useCallback, useMemo } from 'react';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { GameState, fantasyBuildings, scifiBuildings } from './GameStateManager';

export interface CombatUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  effect: { damage?: number; explosionRadius?: number; fireRate?: number; accuracy?: number; autoAimRange?: number };
}

export interface WeaponUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  effect: { damage?: number; fireRate?: number; range?: number };
}

const defaultCombatUpgrades: CombatUpgrade[] = [
  {
    id: 'manaBlaster',
    name: 'Mana Blaster',
    description: 'Basic magical projectile',
    icon: '🧙‍♂️',
    level: 0,
    maxLevel: 10,
    baseCost: 50,
    effect: { damage: 1 }
  },
  {
    id: 'explosionRadius',
    name: 'Explosion Radius',
    description: 'Increases splash damage area',
    icon: '💥',
    level: 0,
    maxLevel: 8,
    baseCost: 100,
    effect: { explosionRadius: 2 }
  },
  {
    id: 'fireRate',
    name: 'Fire Rate',
    description: 'Faster projectile shooting',
    icon: '⚡',
    level: 0,
    maxLevel: 15,
    baseCost: 75,
    effect: { fireRate: 0.8 }
  },
  {
    id: 'accuracy',
    name: 'Accuracy Boost',
    description: 'Better aim and precision',
    icon: '🎯',
    level: 0,
    maxLevel: 5,
    baseCost: 150,
    effect: { accuracy: 0.2 }
  },
  {
    id: 'autoAim',
    name: 'Auto-Aim Range',
    description: 'Automatically targets enemies',
    icon: '🔮',
    level: 0,
    maxLevel: 7,
    baseCost: 200,
    effect: { autoAimRange: 5 }
  }
];

const defaultWeaponUpgrades: WeaponUpgrade[] = [
  {
    id: 'damage',
    name: 'Damage',
    description: 'Increases projectile damage',
    icon: '💥',
    level: 0,
    maxLevel: 20,
    baseCost: 25,
    effect: { damage: 1 }
  },
  {
    id: 'fireRate',
    name: 'Fire Rate',
    description: 'Decreases time between shots',
    icon: '⚡',
    level: 0,
    maxLevel: 15,
    baseCost: 40,
    effect: { fireRate: 200 }
  },
  {
    id: 'range',
    name: 'Range',
    description: 'Increases weapon targeting range',
    icon: '🎯',
    level: 0,
    maxLevel: 10,
    baseCost: 60,
    effect: { range: 5 }
  }
];

interface UpgradeManagersProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  currentRealm: 'fantasy' | 'scifi';
  crossRealmUpgradesWithLevels: any[];
}

export const useUpgradeManagers = ({
  gameState,
  setGameState,
  currentRealm,
  crossRealmUpgradesWithLevels
}: UpgradeManagersProps) => {
  // Combat upgrades with current levels
  const combatUpgrades = useMemo(() => {
    return defaultCombatUpgrades.map(upgrade => ({
      ...upgrade,
      level: gameState.combatUpgrades[upgrade.id] || 0
    }));
  }, [gameState.combatUpgrades]);

  // Weapon upgrades with current levels
  const weaponUpgrades = useMemo(() => {
    return defaultWeaponUpgrades.map(upgrade => ({
      ...upgrade,
      level: gameState.weaponUpgrades?.[upgrade.id] || 0
    }));
  }, [gameState.weaponUpgrades]);

  // Combat stats with improved damage calculation
  const combatStats = useMemo(() => {
    const manaBlasterLevel = gameState.combatUpgrades.manaBlaster || 0;
    const fireRateLevel = gameState.combatUpgrades.fireRate || 0;
    const autoAimLevel = gameState.combatUpgrades.autoAim || 0;
    
    return {
      damage: 1 + manaBlasterLevel * 2,
      fireRate: Math.max(500, 1000 - (fireRateLevel * 80)),
      explosionRadius: 2 + (gameState.combatUpgrades.explosionRadius || 0) * 2,
      accuracy: 1 + (gameState.combatUpgrades.accuracy || 0) * 0.2,
      autoAimRange: autoAimLevel > 0 ? 5 + autoAimLevel * 3 : 0
    };
  }, [gameState.combatUpgrades]);

  // Weapon stats calculation
  const weaponStats = useMemo(() => {
    const damageLevel = gameState.weaponUpgrades?.damage || 0;
    const fireRateLevel = gameState.weaponUpgrades?.fireRate || 0;
    const rangeLevel = gameState.weaponUpgrades?.range || 0;
    
    return {
      damage: 1 + damageLevel,
      fireRate: Math.max(500, 2000 - (fireRateLevel * 200)),
      range: 10 + (rangeLevel * 5)
    };
  }, [gameState.weaponUpgrades]);

  const buyBuilding = useCallback((buildingId: string, isFantasy: boolean) => {
    const buildings = isFantasy ? fantasyBuildings : scifiBuildings;
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentCount = isFantasy 
      ? gameState.fantasyBuildings[buildingId] || 0
      : gameState.scifiBuildings[buildingId] || 0;
    
    const cost = Math.floor(building.cost * Math.pow(building.costMultiplier, currentCount));
    const currency = isFantasy ? gameState.mana : gameState.energyCredits;

    if (currency >= cost) {
      setGameState(prev => ({
        ...prev,
        mana: isFantasy ? prev.mana - cost : prev.mana,
        energyCredits: isFantasy ? prev.energyCredits : prev.energyCredits - cost,
        fantasyBuildings: isFantasy 
          ? { ...prev.fantasyBuildings, [buildingId]: currentCount + 1 }
          : prev.fantasyBuildings,
        scifiBuildings: isFantasy 
          ? prev.scifiBuildings
          : { ...prev.scifiBuildings, [buildingId]: currentCount + 1 },
      }));
    }
  }, [gameState.mana, gameState.energyCredits, gameState.fantasyBuildings, gameState.scifiBuildings, setGameState]);

  const performConvergence = useCallback(() => {
    const totalValue = gameState.mana + gameState.energyCredits;
    const shardsGained = Math.floor(Math.sqrt(totalValue / 1000)) + gameState.convergenceCount;
    
    if (shardsGained > 0) {
      setGameState({
        mana: 10,
        energyCredits: 10,
        manaPerSecond: 0,
        energyPerSecond: 0,
        nexusShards: gameState.nexusShards + shardsGained,
        convergenceCount: gameState.convergenceCount + 1,
        fantasyBuildings: {},
        scifiBuildings: {},
        purchasedUpgrades: gameState.purchasedUpgrades,
        lastSaveTime: Date.now(),
        combatUpgrades: gameState.combatUpgrades,
        weaponUpgrades: gameState.weaponUpgrades,
        crossRealmUpgrades: gameState.crossRealmUpgrades,
        waveNumber: gameState.waveNumber,
        enemiesKilled: gameState.enemiesKilled,
        fantasyJourneyDistance: gameState.fantasyJourneyDistance,
        scifiJourneyDistance: gameState.scifiJourneyDistance,
      });
    }
  }, [gameState, setGameState]);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || gameState.nexusShards < upgrade.cost) return;

    setGameState(prev => ({
      ...prev,
      nexusShards: prev.nexusShards - upgrade.cost,
      purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId]
    }));
  }, [gameState.nexusShards, setGameState]);

  const purchaseCombatUpgrade = useCallback((upgradeId: string) => {
    const upgrade = combatUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
    if (gameState.mana >= cost && upgrade.level < upgrade.maxLevel) {
      setGameState(prev => ({
        ...prev,
        mana: prev.mana - cost,
        combatUpgrades: {
          ...prev.combatUpgrades,
          [upgradeId]: (prev.combatUpgrades[upgradeId] || 0) + 1
        }
      }));
    }
  }, [gameState.mana, combatUpgrades, setGameState]);

  const purchaseWeaponUpgrade = useCallback((upgradeId: string) => {
    const upgrade = weaponUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(1.8, upgrade.level));
    if (gameState.mana >= cost && upgrade.level < upgrade.maxLevel) {
      setGameState(prev => ({
        ...prev,
        mana: prev.mana - cost,
        weaponUpgrades: {
          ...prev.weaponUpgrades,
          [upgradeId]: (prev.weaponUpgrades?.[upgradeId] || 0) + 1
        }
      }));
    }
  }, [gameState.mana, weaponUpgrades, setGameState]);

  const purchaseCrossRealmUpgrade = useCallback((upgradeId: string) => {
    const upgrade = crossRealmUpgradesWithLevels.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(1.6, upgrade.level));
    const currency = currentRealm === 'fantasy' ? gameState.mana : gameState.energyCredits;
    
    if (currency >= cost && upgrade.level < upgrade.maxLevel) {
      setGameState(prev => ({
        ...prev,
        mana: currentRealm === 'fantasy' ? prev.mana - cost : prev.mana,
        energyCredits: currentRealm === 'scifi' ? prev.energyCredits - cost : prev.energyCredits,
        crossRealmUpgrades: {
          ...prev.crossRealmUpgrades,
          [upgradeId]: (prev.crossRealmUpgrades?.[upgradeId] || 0) + 1
        }
      }));
    }
  }, [gameState.mana, gameState.energyCredits, currentRealm, crossRealmUpgradesWithLevels, setGameState]);

  return {
    combatUpgrades,
    weaponUpgrades,
    combatStats,
    weaponStats,
    buyBuilding,
    performConvergence,
    purchaseUpgrade,
    purchaseCombatUpgrade,
    purchaseWeaponUpgrade,
    purchaseCrossRealmUpgrade
  };
};

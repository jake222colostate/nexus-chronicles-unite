
import { useState, useEffect, useMemo } from 'react';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { crossRealmUpgrades } from '../data/CrossRealmUpgrades';

export interface GameState {
  mana: number;
  energyCredits: number;
  manaPerSecond: number;
  energyPerSecond: number;
  nexusShards: number;
  convergenceCount: number;
  fantasyBuildings: { [key: string]: number };
  scifiBuildings: { [key: string]: number };
  purchasedUpgrades: string[];
  lastSaveTime: number;
  combatUpgrades: { [key: string]: number };
  weaponUpgrades?: { [key: string]: number };
  scifiWeaponUpgrades?: { [key: string]: number };
  crossRealmUpgrades?: { [key: string]: number };
  fantasyJourneyDistance: number;
  scifiJourneyDistance: number;
  waveNumber: number;
  enemiesKilled: number;
  autoManaLevel: number;
  autoManaRate: number;
  manaPerKill: number;
  cannonCount: number;
}

export interface Building {
  id: string;
  name: string;
  cost: number;
  production: number;
  costMultiplier: number;
  description: string;
  icon: string;
}

export const fantasyBuildings: Building[] = [
  { id: 'altar', name: 'Mana Altar', cost: 10, production: 1, costMultiplier: 1.15, description: 'Ancient stones that channel mystical energy', icon: '🔮' },
  { id: 'tower', name: 'Wizard Tower', cost: 100, production: 8, costMultiplier: 1.2, description: 'Towering spires where mages conduct research', icon: '🗼' },
  { id: 'grove', name: 'Enchanted Grove', cost: 1000, production: 47, costMultiplier: 1.25, description: 'Sacred forests pulsing with natural magic', icon: '🌳' },
  { id: 'temple', name: 'Arcane Temple', cost: 11000, production: 260, costMultiplier: 1.3, description: 'Massive structures devoted to magical arts', icon: '🏛️' },
];

export const scifiBuildings: Building[] = [
  { id: 'generator', name: 'Solar Panel', cost: 15, production: 1, costMultiplier: 1.15, description: 'Basic renewable energy collection', icon: '☀️' },
  { id: 'reactor', name: 'Fusion Reactor', cost: 150, production: 10, costMultiplier: 1.2, description: 'Advanced nuclear fusion technology', icon: '⚡' },
  { id: 'station', name: 'Space Station', cost: 1500, production: 64, costMultiplier: 1.25, description: 'Orbital platforms generating massive energy', icon: '🛰️' },
  { id: 'megastructure', name: 'Dyson Sphere', cost: 20000, production: 430, costMultiplier: 1.3, description: 'Planet-scale energy harvesting systems', icon: '🌌' },
  { id: 'orbital_array', name: 'Orbital Array', cost: 150000, production: 1200, costMultiplier: 1.35, description: 'Rings of satellites beaming power', icon: '📡' },
  { id: 'singularity_core', name: 'Singularity Core', cost: 1000000, production: 8000, costMultiplier: 1.4, description: 'Harnesses miniature black holes', icon: '🕳️' },
];

const defaultGameState: GameState = {
  mana: 10,
  energyCredits: 10,
  manaPerSecond: 0,
  energyPerSecond: 0,
  nexusShards: 0,
  convergenceCount: 0,
  fantasyBuildings: {},
  scifiBuildings: {},
  purchasedUpgrades: [],
  lastSaveTime: Date.now(),
  combatUpgrades: {},
  weaponUpgrades: {},
  scifiWeaponUpgrades: {},
  crossRealmUpgrades: {},
  fantasyJourneyDistance: 0,
  scifiJourneyDistance: 0,
  waveNumber: 1,
  enemiesKilled: 0,
  autoManaLevel: 0,
  autoManaRate: 0,
  manaPerKill: 5,
  cannonCount: 1,
};

export const useGameStateManager = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('celestialNexusGame');
    if (saved) {
      const parsedState = JSON.parse(saved);
      return {
        ...parsedState,
        purchasedUpgrades: parsedState.purchasedUpgrades || [],
        lastSaveTime: parsedState.lastSaveTime || Date.now(),
        combatUpgrades: parsedState.combatUpgrades || {},
        weaponUpgrades: parsedState.weaponUpgrades || {},
        scifiWeaponUpgrades: parsedState.scifiWeaponUpgrades || {},
        crossRealmUpgrades: parsedState.crossRealmUpgrades || {},
        fantasyJourneyDistance: parsedState.fantasyJourneyDistance || 0,
        scifiJourneyDistance: parsedState.scifiJourneyDistance || 0,
        waveNumber: parsedState.waveNumber || 1,
        enemiesKilled: parsedState.enemiesKilled || 0,
        autoManaLevel: parsedState.autoManaLevel || 0,
        autoManaRate: parsedState.autoManaRate || 0,
        manaPerKill: parsedState.manaPerKill || 5,
        cannonCount: parsedState.cannonCount || 1,
      };
    }
    return defaultGameState;
  });

  // Stable references to prevent re-renders
  const stableFantasyBuildings = useMemo(() => gameState.fantasyBuildings || {}, [gameState.fantasyBuildings]);
  const stableScifiBuildings = useMemo(() => gameState.scifiBuildings || {}, [gameState.scifiBuildings]);
  const stablePurchasedUpgrades = useMemo(() => gameState.purchasedUpgrades || [], [gameState.purchasedUpgrades]);

  // Cross-realm upgrades with current levels
  const crossRealmUpgradesWithLevels = useMemo(() => {
    return crossRealmUpgrades.map(upgrade => ({
      ...upgrade,
      level: gameState.crossRealmUpgrades?.[upgrade.id] || 0
    }));
  }, [gameState.crossRealmUpgrades]);

  // Calculate offline progress on mount
  useEffect(() => {
    const now = Date.now();
    const offlineTime = Math.min((now - gameState.lastSaveTime) / 1000, 3600);
    
    if (offlineTime > 60) {
      const offlineMana = (gameState.manaPerSecond + gameState.autoManaRate) * offlineTime;
      const offlineEnergy = gameState.energyPerSecond * offlineTime;
      
      setGameState(prev => ({
        ...prev,
        mana: prev.mana + offlineMana,
        energyCredits: prev.energyCredits + offlineEnergy,
        lastSaveTime: now,
      }));
    }
  }, []);

  return {
    gameState,
    setGameState,
    stableFantasyBuildings,
    stableScifiBuildings,
    stablePurchasedUpgrades,
    crossRealmUpgradesWithLevels
  };
};


import { useMemo } from 'react';

interface GameState {
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
}

export const useStableGameState = (gameState: GameState) => {
  // Stabilize primitive values to prevent unnecessary re-renders
  const stablePrimitives = useMemo(() => ({
    mana: gameState.mana || 0,
    energyCredits: gameState.energyCredits || 0,
    manaPerSecond: gameState.manaPerSecond || 0,
    energyPerSecond: gameState.energyPerSecond || 0,
    nexusShards: gameState.nexusShards || 0,
    convergenceCount: gameState.convergenceCount || 0,
    lastSaveTime: gameState.lastSaveTime || Date.now(),
  }), [
    gameState.mana,
    gameState.energyCredits,
    gameState.manaPerSecond,
    gameState.energyPerSecond,
    gameState.nexusShards,
    gameState.convergenceCount,
    gameState.lastSaveTime
  ]);

  // Stabilize object references with safe defaults
  const stableObjects = useMemo(() => ({
    fantasyBuildings: gameState.fantasyBuildings || {},
    scifiBuildings: gameState.scifiBuildings || {},
    purchasedUpgrades: gameState.purchasedUpgrades || [],
  }), [
    JSON.stringify(gameState.fantasyBuildings || {}),
    JSON.stringify(gameState.scifiBuildings || {}),
    JSON.stringify(gameState.purchasedUpgrades || [])
  ]);

  // Count values for stable dependencies
  const stableCounts = useMemo(() => ({
    purchasedUpgradesCount: (gameState.purchasedUpgrades || []).length,
    fantasyBuildingsCount: Object.keys(gameState.fantasyBuildings || {}).length,
    scifiBuildingsCount: Object.keys(gameState.scifiBuildings || {}).length,
  }), [
    (gameState.purchasedUpgrades || []).length,
    Object.keys(gameState.fantasyBuildings || {}).length,
    Object.keys(gameState.scifiBuildings || {}).length
  ]);

  return {
    ...stablePrimitives,
    ...stableObjects,
    ...stableCounts
  };
};


import { useMemo, useRef } from 'react';

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
  // Use refs to store previous values and only update when actually changed
  const previousValuesRef = useRef<GameState | null>(null);
  const stableStateRef = useRef<GameState | null>(null);

  // Check if any primitive values actually changed
  const primitivesChanged = !previousValuesRef.current ||
    gameState.mana !== previousValuesRef.current.mana ||
    gameState.energyCredits !== previousValuesRef.current.energyCredits ||
    gameState.manaPerSecond !== previousValuesRef.current.manaPerSecond ||
    gameState.energyPerSecond !== previousValuesRef.current.energyPerSecond ||
    gameState.nexusShards !== previousValuesRef.current.nexusShards ||
    gameState.convergenceCount !== previousValuesRef.current.convergenceCount ||
    gameState.lastSaveTime !== previousValuesRef.current.lastSaveTime;

  // Check if object references actually changed by comparing lengths and contents
  const objectsChanged = !previousValuesRef.current ||
    Object.keys(gameState.fantasyBuildings || {}).length !== Object.keys(previousValuesRef.current.fantasyBuildings || {}).length ||
    Object.keys(gameState.scifiBuildings || {}).length !== Object.keys(previousValuesRef.current.scifiBuildings || {}).length ||
    (gameState.purchasedUpgrades || []).length !== (previousValuesRef.current.purchasedUpgrades || []).length;

  // Only create new stable state if something actually changed
  if (!stableStateRef.current || primitivesChanged || objectsChanged) {
    console.log('useStableGameState: Values changed, creating new stable state');
    
    stableStateRef.current = {
      mana: gameState.mana || 0,
      energyCredits: gameState.energyCredits || 0,
      manaPerSecond: gameState.manaPerSecond || 0,
      energyPerSecond: gameState.energyPerSecond || 0,
      nexusShards: gameState.nexusShards || 0,
      convergenceCount: gameState.convergenceCount || 0,
      lastSaveTime: gameState.lastSaveTime || Date.now(),
      fantasyBuildings: gameState.fantasyBuildings || {},
      scifiBuildings: gameState.scifiBuildings || {},
      purchasedUpgrades: gameState.purchasedUpgrades || [],
    };
    
    previousValuesRef.current = { ...gameState };
  }

  return stableStateRef.current;
};


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

// Deep comparison function for objects
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
};

// Array comparison function
const arrayEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};

export const useStableGameState = (gameState: GameState) => {
  const previousStateRef = useRef<GameState | null>(null);
  const stableStateRef = useRef<GameState | null>(null);
  
  return useMemo(() => {
    const prev = previousStateRef.current;
    
    // Ensure safe defaults for all values
    const safeGameState = {
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
    
    // If no previous state, store current and return it
    if (!prev) {
      previousStateRef.current = safeGameState;
      stableStateRef.current = safeGameState;
      return safeGameState;
    }
    
    // Check if anything actually changed using safe comparisons
    const primitivesChanged = 
      safeGameState.mana !== prev.mana ||
      safeGameState.energyCredits !== prev.energyCredits ||
      safeGameState.manaPerSecond !== prev.manaPerSecond ||
      safeGameState.energyPerSecond !== prev.energyPerSecond ||
      safeGameState.nexusShards !== prev.nexusShards ||
      safeGameState.convergenceCount !== prev.convergenceCount ||
      safeGameState.lastSaveTime !== prev.lastSaveTime;
    
    const buildingsChanged = 
      !deepEqual(safeGameState.fantasyBuildings, prev.fantasyBuildings) ||
      !deepEqual(safeGameState.scifiBuildings, prev.scifiBuildings);
    
    const upgradesChanged = 
      !arrayEqual(safeGameState.purchasedUpgrades, prev.purchasedUpgrades);
    
    // Only create new state if something actually changed
    if (primitivesChanged || buildingsChanged || upgradesChanged) {
      previousStateRef.current = safeGameState;
      stableStateRef.current = safeGameState;
      return safeGameState;
    }
    
    // Return cached stable state if nothing changed
    return stableStateRef.current || safeGameState;
  }, [
    // Use primitive values directly instead of JSON.stringify to prevent infinite loops
    gameState.mana,
    gameState.energyCredits,
    gameState.manaPerSecond,
    gameState.energyPerSecond,
    gameState.nexusShards,
    gameState.convergenceCount,
    gameState.lastSaveTime,
    // For objects/arrays, use length and key checks instead of stringification
    Object.keys(gameState.fantasyBuildings || {}).length,
    Object.keys(gameState.scifiBuildings || {}).length,
    (gameState.purchasedUpgrades || []).length,
    // Include a hash of the actual values but stable
    Object.values(gameState.fantasyBuildings || {}).join(','),
    Object.values(gameState.scifiBuildings || {}).join(','),
    (gameState.purchasedUpgrades || []).join(',')
  ]);
};

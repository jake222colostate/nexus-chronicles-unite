
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
  
  return useMemo(() => {
    const prev = previousStateRef.current;
    
    // If no previous state, store current and return it
    if (!prev) {
      const newState = {
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
      previousStateRef.current = newState;
      return newState;
    }
    
    // Check if anything actually changed
    const primitivesChanged = 
      gameState.mana !== prev.mana ||
      gameState.energyCredits !== prev.energyCredits ||
      gameState.manaPerSecond !== prev.manaPerSecond ||
      gameState.energyPerSecond !== prev.energyPerSecond ||
      gameState.nexusShards !== prev.nexusShards ||
      gameState.convergenceCount !== prev.convergenceCount ||
      gameState.lastSaveTime !== prev.lastSaveTime;
    
    const buildingsChanged = 
      !deepEqual(gameState.fantasyBuildings || {}, prev.fantasyBuildings || {}) ||
      !deepEqual(gameState.scifiBuildings || {}, prev.scifiBuildings || {});
    
    const upgradesChanged = 
      !arrayEqual(gameState.purchasedUpgrades || [], prev.purchasedUpgrades || []);
    
    // Only create new state if something actually changed
    if (primitivesChanged || buildingsChanged || upgradesChanged) {
      const newState = {
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
      previousStateRef.current = newState;
      return newState;
    }
    
    // Return previous state if nothing changed
    return prev;
  }, [
    gameState.mana,
    gameState.energyCredits,
    gameState.manaPerSecond,
    gameState.energyPerSecond,
    gameState.nexusShards,
    gameState.convergenceCount,
    gameState.lastSaveTime,
    JSON.stringify(gameState.fantasyBuildings || {}),
    JSON.stringify(gameState.scifiBuildings || {}),
    JSON.stringify(gameState.purchasedUpgrades || [])
  ]);
};

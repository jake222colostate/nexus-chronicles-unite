
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
};

export const initializeGameState = (): GameState => {
  try {
    console.log('GameStateUtils: Initializing game state');
    const saved = localStorage.getItem('celestialNexusGame');
    if (!saved) {
      console.log('GameStateUtils: No saved data found, using defaults');
      return { ...defaultGameState };
    }

    const parsedState = JSON.parse(saved);
    console.log('GameStateUtils: Loaded saved state', parsedState);
    
    // Validate and merge with defaults - CRITICAL: Always provide safe fallbacks
    const safeState = {
      mana: typeof parsedState.mana === 'number' ? parsedState.mana : defaultGameState.mana,
      energyCredits: typeof parsedState.energyCredits === 'number' ? parsedState.energyCredits : defaultGameState.energyCredits,
      manaPerSecond: typeof parsedState.manaPerSecond === 'number' ? parsedState.manaPerSecond : defaultGameState.manaPerSecond,
      energyPerSecond: typeof parsedState.energyPerSecond === 'number' ? parsedState.energyPerSecond : defaultGameState.energyPerSecond,
      nexusShards: typeof parsedState.nexusShards === 'number' ? parsedState.nexusShards : defaultGameState.nexusShards,
      convergenceCount: typeof parsedState.convergenceCount === 'number' ? parsedState.convergenceCount : defaultGameState.convergenceCount,
      fantasyBuildings: (typeof parsedState.fantasyBuildings === 'object' && parsedState.fantasyBuildings !== null) ? parsedState.fantasyBuildings : defaultGameState.fantasyBuildings,
      scifiBuildings: (typeof parsedState.scifiBuildings === 'object' && parsedState.scifiBuildings !== null) ? parsedState.scifiBuildings : defaultGameState.scifiBuildings,
      purchasedUpgrades: Array.isArray(parsedState.purchasedUpgrades) ? parsedState.purchasedUpgrades : defaultGameState.purchasedUpgrades,
      lastSaveTime: typeof parsedState.lastSaveTime === 'number' ? parsedState.lastSaveTime : defaultGameState.lastSaveTime,
    };
    
    console.log('GameStateUtils: Returning safe state', safeState);
    return safeState;
  } catch (error) {
    console.error('GameStateUtils: Failed to load game state, using defaults:', error);
    return { ...defaultGameState };
  }
};

export const saveGameState = (gameState: GameState): void => {
  try {
    // SAFE: Always validate state before saving to prevent corrupted data
    const safeGameState = {
      mana: gameState.mana || 0,
      energyCredits: gameState.energyCredits || 0,
      manaPerSecond: gameState.manaPerSecond || 0,
      energyPerSecond: gameState.energyPerSecond || 0,
      nexusShards: gameState.nexusShards || 0,
      convergenceCount: gameState.convergenceCount || 0,
      fantasyBuildings: gameState.fantasyBuildings || {},
      scifiBuildings: gameState.scifiBuildings || {},
      purchasedUpgrades: gameState.purchasedUpgrades || [],
      lastSaveTime: gameState.lastSaveTime || Date.now(),
    };
    
    localStorage.setItem('celestialNexusGame', JSON.stringify(safeGameState));
    console.log('GameStateUtils: Game state saved successfully');
  } catch (error) {
    console.error('GameStateUtils: Failed to save game state:', error);
  }
};

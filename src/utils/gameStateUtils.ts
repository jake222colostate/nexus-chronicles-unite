
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
    
    // CRITICAL: Always provide safe fallbacks to prevent undefined values
    const safeState = {
      mana: typeof parsedState.mana === 'number' && isFinite(parsedState.mana) ? parsedState.mana : defaultGameState.mana,
      energyCredits: typeof parsedState.energyCredits === 'number' && isFinite(parsedState.energyCredits) ? parsedState.energyCredits : defaultGameState.energyCredits,
      manaPerSecond: typeof parsedState.manaPerSecond === 'number' && isFinite(parsedState.manaPerSecond) ? parsedState.manaPerSecond : defaultGameState.manaPerSecond,
      energyPerSecond: typeof parsedState.energyPerSecond === 'number' && isFinite(parsedState.energyPerSecond) ? parsedState.energyPerSecond : defaultGameState.energyPerSecond,
      nexusShards: typeof parsedState.nexusShards === 'number' && isFinite(parsedState.nexusShards) ? parsedState.nexusShards : defaultGameState.nexusShards,
      convergenceCount: typeof parsedState.convergenceCount === 'number' && isFinite(parsedState.convergenceCount) ? parsedState.convergenceCount : defaultGameState.convergenceCount,
      fantasyBuildings: (typeof parsedState.fantasyBuildings === 'object' && parsedState.fantasyBuildings !== null && !Array.isArray(parsedState.fantasyBuildings)) ? parsedState.fantasyBuildings : defaultGameState.fantasyBuildings,
      scifiBuildings: (typeof parsedState.scifiBuildings === 'object' && parsedState.scifiBuildings !== null && !Array.isArray(parsedState.scifiBuildings)) ? parsedState.scifiBuildings : defaultGameState.scifiBuildings,
      purchasedUpgrades: Array.isArray(parsedState.purchasedUpgrades) ? parsedState.purchasedUpgrades : defaultGameState.purchasedUpgrades,
      lastSaveTime: typeof parsedState.lastSaveTime === 'number' && isFinite(parsedState.lastSaveTime) ? parsedState.lastSaveTime : defaultGameState.lastSaveTime,
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
      mana: (typeof gameState.mana === 'number' && isFinite(gameState.mana)) ? gameState.mana : 0,
      energyCredits: (typeof gameState.energyCredits === 'number' && isFinite(gameState.energyCredits)) ? gameState.energyCredits : 0,
      manaPerSecond: (typeof gameState.manaPerSecond === 'number' && isFinite(gameState.manaPerSecond)) ? gameState.manaPerSecond : 0,
      energyPerSecond: (typeof gameState.energyPerSecond === 'number' && isFinite(gameState.energyPerSecond)) ? gameState.energyPerSecond : 0,
      nexusShards: (typeof gameState.nexusShards === 'number' && isFinite(gameState.nexusShards)) ? gameState.nexusShards : 0,
      convergenceCount: (typeof gameState.convergenceCount === 'number' && isFinite(gameState.convergenceCount)) ? gameState.convergenceCount : 0,
      fantasyBuildings: (typeof gameState.fantasyBuildings === 'object' && gameState.fantasyBuildings !== null && !Array.isArray(gameState.fantasyBuildings)) ? gameState.fantasyBuildings : {},
      scifiBuildings: (typeof gameState.scifiBuildings === 'object' && gameState.scifiBuildings !== null && !Array.isArray(gameState.scifiBuildings)) ? gameState.scifiBuildings : {},
      purchasedUpgrades: Array.isArray(gameState.purchasedUpgrades) ? gameState.purchasedUpgrades : [],
      lastSaveTime: (typeof gameState.lastSaveTime === 'number' && isFinite(gameState.lastSaveTime)) ? gameState.lastSaveTime : Date.now(),
    };
    
    localStorage.setItem('celestialNexusGame', JSON.stringify(safeGameState));
    console.log('GameStateUtils: Game state saved successfully');
  } catch (error) {
    console.error('GameStateUtils: Failed to save game state:', error);
  }
};

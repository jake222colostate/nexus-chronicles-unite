
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
    const saved = localStorage.getItem('celestialNexusGame');
    if (!saved) {
      return { ...defaultGameState };
    }

    const parsedState = JSON.parse(saved);
    
    // Validate and merge with defaults
    return {
      mana: typeof parsedState.mana === 'number' ? parsedState.mana : defaultGameState.mana,
      energyCredits: typeof parsedState.energyCredits === 'number' ? parsedState.energyCredits : defaultGameState.energyCredits,
      manaPerSecond: typeof parsedState.manaPerSecond === 'number' ? parsedState.manaPerSecond : defaultGameState.manaPerSecond,
      energyPerSecond: typeof parsedState.energyPerSecond === 'number' ? parsedState.energyPerSecond : defaultGameState.energyPerSecond,
      nexusShards: typeof parsedState.nexusShards === 'number' ? parsedState.nexusShards : defaultGameState.nexusShards,
      convergenceCount: typeof parsedState.convergenceCount === 'number' ? parsedState.convergenceCount : defaultGameState.convergenceCount,
      fantasyBuildings: typeof parsedState.fantasyBuildings === 'object' && parsedState.fantasyBuildings !== null ? parsedState.fantasyBuildings : defaultGameState.fantasyBuildings,
      scifiBuildings: typeof parsedState.scifiBuildings === 'object' && parsedState.scifiBuildings !== null ? parsedState.scifiBuildings : defaultGameState.scifiBuildings,
      purchasedUpgrades: Array.isArray(parsedState.purchasedUpgrades) ? parsedState.purchasedUpgrades : defaultGameState.purchasedUpgrades,
      lastSaveTime: typeof parsedState.lastSaveTime === 'number' ? parsedState.lastSaveTime : defaultGameState.lastSaveTime,
    };
  } catch (error) {
    console.error('Failed to load game state, using defaults:', error);
    return { ...defaultGameState };
  }
};

export const saveGameState = (gameState: GameState): void => {
  try {
    localStorage.setItem('celestialNexusGame', JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

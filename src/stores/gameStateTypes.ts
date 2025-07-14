export interface GameState {
  // Universal Resources (shared across all realms)
  mana: number;
  energyCredits: number;
  nexusShards: number;
  
  // Resource Generation Rates
  manaPerSecond: number;
  energyPerSecond: number;
  
  // Convergence System
  convergenceCount: number;
  convergenceProgress: number;
  
  // Offline progression
  lastSaveTime: number;
  
  // Unlocked Upgrades (shared across realms)
  unlockedUpgrades: string[];
  
  // Placed Upgrades in Nexus Sandbox
  placedUpgrades: Array<{
    id: string;
    x: number;
    z: number;
    upgradeType: string;
    realm: 'fantasy' | 'scifi';
  }>;
}

export const initialGameState: GameState = {
  mana: 0,
  energyCredits: 0,
  nexusShards: 25,
  manaPerSecond: 0,
  energyPerSecond: 0,
  convergenceCount: 0,
  convergenceProgress: 0,
  lastSaveTime: Date.now(),
  unlockedUpgrades: [],
  placedUpgrades: []
};
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
  
  // Nexus Module System
  placedModules: Array<{
    id: string;
    moduleId: string;
    position: [number, number, number];
    moduleType: string;
    realm: 'fantasy' | 'scifi' | 'nexus';
  }>;
  
  // Fantasy and Sci-Fi progression levels
  fantasyLevel: number;
  scifiLevel: number;
  completedQuests: string[];
}

export const initialGameState: GameState = {
  mana: 500, // Start with some mana for testing
  energyCredits: 300, // Start with some energy for testing
  nexusShards: 25,
  manaPerSecond: 0,
  energyPerSecond: 0,
  convergenceCount: 0,
  convergenceProgress: 0,
  lastSaveTime: Date.now(),
  unlockedUpgrades: [],
  placedUpgrades: [],
  placedModules: [],
  fantasyLevel: 0,
  scifiLevel: 0,
  completedQuests: []
};
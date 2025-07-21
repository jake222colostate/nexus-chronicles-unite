export interface GameStateActions {
  // Resource Management
  addMana: (amount: number) => void;
  spendMana: (amount: number) => boolean;
  addEnergy: (amount: number) => void;
  spendEnergy: (amount: number) => boolean;
  addNexusShards: (amount: number) => void;
  spendNexusShards: (amount: number) => boolean;
  
  // Conversion System
  convertManaToShards: (manaAmount: number) => boolean;
  convertEnergyToShards: (energyAmount: number) => boolean;
  
  // Upgrade Management
  unlockUpgrade: (upgradeId: string) => void;
  placeUpgrade: (upgrade: { id: string; x: number; z: number; upgradeType: string; realm: 'fantasy' | 'scifi' }) => void;
  removeUpgrade: (x: number, z: number) => void;
  
  // Rate Management
  setManaPerSecond: (rate: number) => void;
  setEnergyPerSecond: (rate: number) => void;
  
  // Offline Progression
  calculateOfflineProgress: () => void;
  
  // Convergence
  incrementConvergence: () => void;
  
  // Reset (for testing)
  resetGameState: () => void;
}

export const createGameStateActions = (set: any, get: any): GameStateActions => ({
  // Resource Management
  addMana: (amount) => 
    set((state: any) => ({ mana: state.mana + amount })),
  
  spendMana: (amount) => {
    const state = get();
    if (state.mana >= amount) {
      set({ mana: state.mana - amount });
      return true;
    }
    return false;
  },

  addEnergy: (amount) => 
    set((state: any) => ({ energyCredits: state.energyCredits + amount })),
  
  spendEnergy: (amount) => {
    const state = get();
    if (state.energyCredits >= amount) {
      set({ energyCredits: state.energyCredits - amount });
      return true;
    }
    return false;
  },

  addNexusShards: (amount) => 
    set((state: any) => ({ nexusShards: state.nexusShards + amount })),
  
  spendNexusShards: (amount) => {
    const state = get();
    if (state.nexusShards >= amount) {
      set({ nexusShards: state.nexusShards - amount });
      return true;
    }
    return false;
  },

  // Conversion System (1 Mana = 0.1 Shards, 1 Energy = 0.1 Shards)
  convertManaToShards: (manaAmount) => {
    const state = get();
    if (state.mana >= manaAmount) {
      const shardsToAdd = Math.floor(manaAmount * 0.1);
      set({ 
        mana: state.mana - manaAmount,
        nexusShards: state.nexusShards + shardsToAdd
      });
      return true;
    }
    return false;
  },

  convertEnergyToShards: (energyAmount) => {
    const state = get();
    if (state.energyCredits >= energyAmount) {
      const shardsToAdd = Math.floor(energyAmount * 0.1);
      set({ 
        energyCredits: state.energyCredits - energyAmount,
        nexusShards: state.nexusShards + shardsToAdd
      });
      return true;
    }
    return false;
  },

  // Upgrade Management
  unlockUpgrade: (upgradeId) =>
    set((state: any) => ({
      unlockedUpgrades: [...state.unlockedUpgrades, upgradeId]
    })),

  placeUpgrade: (upgrade) =>
    set((state: any) => ({
      placedUpgrades: [...state.placedUpgrades, upgrade]
    })),

  removeUpgrade: (x, z) =>
    set((state: any) => ({
      placedUpgrades: state.placedUpgrades.filter(
        (upgrade: any) => !(upgrade.x === x && upgrade.z === z)
      )
    })),

  // Rate Management
  setManaPerSecond: (rate) => set({ manaPerSecond: rate }),
  setEnergyPerSecond: (rate) => set({ energyPerSecond: rate }),

  // Offline Progression
  calculateOfflineProgress: () => {
    const state = get();
    const now = Date.now();
    const timeAwayMs = now - state.lastSaveTime;
    const timeAwaySeconds = Math.floor(timeAwayMs / 1000);
    
    if (timeAwaySeconds > 0) {
      const offlineMana = state.manaPerSecond * timeAwaySeconds;
      const offlineEnergy = state.energyPerSecond * timeAwaySeconds;
      
      set({
        mana: state.mana + offlineMana,
        energyCredits: state.energyCredits + offlineEnergy,
        lastSaveTime: now
      });
      
      // Show offline progress message if significant time passed
      if (timeAwaySeconds > 60) {
        // console.log(`Welcome back! You earned ${offlineMana} mana and ${offlineEnergy} energy while away.`);
      }
    } else {
      set({ lastSaveTime: now });
    }
  },

  // Convergence
  incrementConvergence: () =>
    set((state: any) => ({
      convergenceCount: state.convergenceCount + 1,
      convergenceProgress: Math.min(100, state.convergenceProgress + 10)
    })),

  // Reset
  resetGameState: () => set({
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
  })
});
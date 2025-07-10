import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
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

interface GameStateActions {
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
  
  // Convergence
  incrementConvergence: () => void;
  
  // Reset (for testing)
  resetGameState: () => void;
}

const initialState: GameState = {
  mana: 1000,
  energyCredits: 800,
  nexusShards: 25,
  manaPerSecond: 15,
  energyPerSecond: 12,
  convergenceCount: 3,
  convergenceProgress: 45,
  unlockedUpgrades: [],
  placedUpgrades: []
};

export const useGameStateStore = create<GameState & GameStateActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Resource Management
      addMana: (amount) => 
        set((state) => ({ mana: state.mana + amount })),
      
      spendMana: (amount) => {
        const state = get();
        if (state.mana >= amount) {
          set({ mana: state.mana - amount });
          return true;
        }
        return false;
      },

      addEnergy: (amount) => 
        set((state) => ({ energyCredits: state.energyCredits + amount })),
      
      spendEnergy: (amount) => {
        const state = get();
        if (state.energyCredits >= amount) {
          set({ energyCredits: state.energyCredits - amount });
          return true;
        }
        return false;
      },

      addNexusShards: (amount) => 
        set((state) => ({ nexusShards: state.nexusShards + amount })),
      
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
        set((state) => ({
          unlockedUpgrades: [...state.unlockedUpgrades, upgradeId]
        })),

      placeUpgrade: (upgrade) =>
        set((state) => ({
          placedUpgrades: [...state.placedUpgrades, upgrade]
        })),

      removeUpgrade: (x, z) =>
        set((state) => ({
          placedUpgrades: state.placedUpgrades.filter(
            (upgrade) => !(upgrade.x === x && upgrade.z === z)
          )
        })),

      // Rate Management
      setManaPerSecond: (rate) => set({ manaPerSecond: rate }),
      setEnergyPerSecond: (rate) => set({ energyPerSecond: rate }),

      // Convergence
      incrementConvergence: () =>
        set((state) => ({
          convergenceCount: state.convergenceCount + 1,
          convergenceProgress: Math.min(100, state.convergenceProgress + 10)
        })),

      // Reset
      resetGameState: () => set(initialState)
    }),
    {
      name: 'nexus-game-state',
      version: 1
    }
  )
);
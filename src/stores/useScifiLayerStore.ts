import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScifiLayerState {
  // Core layer tracking
  altitude: number;
  currentLayer: number;
  highestLayer: number;
  timeInCurrentLayer: number;
  
  // Progress tracking
  meteorsDestroyed: number;
  unlockedUpgrades: string[];
  cannonProgress: Record<string, { tier: number; abilities: string[] }>;
  
  // Layer enter timestamps
  layerEnterTime: number;
  
  // Actions
  updateAltitude: (newAltitude: number) => void;
  enterLayer: (layerNumber: number) => void;
  updateTimeInLayer: (deltaTime: number) => void;
  destroyMeteor: () => void;
  unlockUpgrade: (upgradeId: string) => void;
  updateCannonProgress: (cannonId: string, tier: number, abilities: string[]) => void;
  
  // Internal unlock checking methods
  checkLayerUnlocks: (layerNumber: number) => void;
  checkMeteorUnlocks: () => void;
  checkTimeBasedUnlocks: () => void;
  checkCannonUnlocks: () => void;
  
  // Debug utilities
  teleportToLayer: (layerNumber: number) => void;
  resetProgress: () => void;
  unlockAllUpgrades: () => void;
}

const LAYER_ALTITUDE_THRESHOLD = 1000; // Each layer = 1000 altitude units

const defaultUpgrades = [
  'ionStabilizerCore',
  'quantumCapacitor', 
  'meteorRefractor',
  'gravityAnchorArray',
  'arcLensProjector',
  'naniteBloom',
  'warpConduitRelay'
];

export const useScifiLayerStore = create<ScifiLayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      altitude: 0,
      currentLayer: 1,
      highestLayer: 1,
      timeInCurrentLayer: 0,
      meteorsDestroyed: 0,
      unlockedUpgrades: [],
      cannonProgress: {},
      layerEnterTime: Date.now(),

      // Update altitude and check for layer transitions
      updateAltitude: (newAltitude: number) => {
        const currentLayer = Math.floor(newAltitude / LAYER_ALTITUDE_THRESHOLD) + 1;
        const state = get();
        
        set({ altitude: newAltitude });
        
        // Check if we've entered a new layer
        if (currentLayer > state.currentLayer) {
          get().enterLayer(currentLayer);
        }
      },

      // Handle entering a new layer
      enterLayer: (layerNumber: number) => {
        const state = get();
        const now = Date.now();
        
        set({
          currentLayer: layerNumber,
          highestLayer: Math.max(state.highestLayer, layerNumber),
          timeInCurrentLayer: 0,
          layerEnterTime: now
        });

        // Fire layer enter event
        console.log(`🌌 Entered Layer ${layerNumber}!`);
        
        // Check unlock conditions based on layer
        get().checkLayerUnlocks(layerNumber);
      },

      // Update time spent in current layer
      updateTimeInLayer: (deltaTime: number) => {
        set((state) => ({
          timeInCurrentLayer: state.timeInCurrentLayer + deltaTime
        }));
        
        // Check time-based unlocks
        get().checkTimeBasedUnlocks();
      },

      // Track meteor destruction
      destroyMeteor: () => {
        set((state) => ({
          meteorsDestroyed: state.meteorsDestroyed + 1
        }));
        
        // Check meteor-based unlocks
        get().checkMeteorUnlocks();
      },

      // Unlock upgrade
      unlockUpgrade: (upgradeId: string) => {
        set((state) => {
          if (!state.unlockedUpgrades.includes(upgradeId)) {
            console.log(`🔓 Unlocked upgrade: ${upgradeId}`);
            return {
              unlockedUpgrades: [...state.unlockedUpgrades, upgradeId]
            };
          }
          return state;
        });
      },

      // Update cannon progress
      updateCannonProgress: (cannonId: string, tier: number, abilities: string[]) => {
        set((state) => ({
          cannonProgress: {
            ...state.cannonProgress,
            [cannonId]: { tier, abilities }
          }
        }));
        
        // Check cannon-based unlocks
        get().checkCannonUnlocks();
      },

      // Check unlock conditions
      checkLayerUnlocks: (layerNumber: number) => {
        const { unlockUpgrade } = get();
        
        if (layerNumber >= 2) {
          unlockUpgrade('meteorRefractor');
        }
      },

      checkMeteorUnlocks: () => {
        const { meteorsDestroyed, unlockUpgrade } = get();
        
        if (meteorsDestroyed >= 500) {
          unlockUpgrade('ionStabilizerCore');
        }
      },

      checkTimeBasedUnlocks: () => {
        const { currentLayer, timeInCurrentLayer, unlockUpgrade } = get();
        
        // Gravity Anchor Array - Survive 2 minutes in Layer 3
        if (currentLayer >= 3 && timeInCurrentLayer >= 120000) { // 2 minutes
          unlockUpgrade('gravityAnchorArray');
        }
      },

      checkCannonUnlocks: () => {
        const { cannonProgress, unlockUpgrade } = get();
        const cannons = Object.values(cannonProgress);
        
        // Quantum Capacitor - Upgrade 3 different cannons
        if (cannons.length >= 3) {
          unlockUpgrade('quantumCapacitor');
        }
        
        // Arc Lens Projector - Fully upgrade a long-range cannon
        const hasFullyUpgradedCannon = cannons.some(cannon => cannon.tier >= 5);
        if (hasFullyUpgradedCannon) {
          unlockUpgrade('arcLensProjector');
        }
        
        // Nanite Bloom - Max out any cannon's ability tree
        const hasMaxAbilities = cannons.some(cannon => cannon.abilities.length >= 5);
        if (hasMaxAbilities) {
          unlockUpgrade('naniteBloom');
        }
      },

      // Debug utilities
      teleportToLayer: (layerNumber: number) => {
        const newAltitude = (layerNumber - 1) * LAYER_ALTITUDE_THRESHOLD;
        set({
          altitude: newAltitude,
          currentLayer: layerNumber,
          highestLayer: Math.max(get().highestLayer, layerNumber),
          timeInCurrentLayer: 0,
          layerEnterTime: Date.now()
        });
        console.log(`🚀 Teleported to Layer ${layerNumber}`);
      },

      resetProgress: () => {
        set({
          altitude: 0,
          currentLayer: 1,
          highestLayer: 1,
          timeInCurrentLayer: 0,
          meteorsDestroyed: 0,
          unlockedUpgrades: [],
          cannonProgress: {},
          layerEnterTime: Date.now()
        });
        console.log('🔄 Sci-Fi progress reset');
      },

      unlockAllUpgrades: () => {
        set({ unlockedUpgrades: [...defaultUpgrades] });
        console.log('🎯 All Sci-Fi upgrades unlocked');
      }
    }),
    {
      name: 'scifi-layer-storage',
      version: 1
    }
  )
);
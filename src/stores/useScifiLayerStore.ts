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

      // Enhanced unlock conditions for new layers
      checkLayerUnlocks: (layerNumber: number) => {
        const { unlockUpgrade } = get();
        
        // Layer-based unlocks
        if (layerNumber >= 2) {
          unlockUpgrade('meteorRefractor'); // Ionosphere access
        }
        if (layerNumber >= 5) {
          unlockUpgrade('naniteBloom'); // Cosmic Radiation survival
        }
        if (layerNumber >= 7) {
          unlockUpgrade('warpConduitRelay'); // Dark Matter navigation
        }
      },

      checkMeteorUnlocks: () => {
        const { meteorsDestroyed, unlockUpgrade } = get();
        
        // Progressive meteor-based unlocks
        if (meteorsDestroyed >= 100) {
          unlockUpgrade('ionStabilizerCore'); // Basic platform stability
        }
        if (meteorsDestroyed >= 750) {
          unlockUpgrade('quantumCapacitor'); // Advanced energy systems
        }
        if (meteorsDestroyed >= 1500) {
          unlockUpgrade('arcLensProjector'); // Precision targeting
        }
      },

      checkTimeBasedUnlocks: () => {
        const { currentLayer, timeInCurrentLayer, unlockUpgrade } = get();
        
        // Time-based survival unlocks
        if (currentLayer >= 3 && timeInCurrentLayer >= 90000) { // 1.5 minutes in Solar Wind
          unlockUpgrade('gravityAnchorArray');
        }
        if (currentLayer >= 6 && timeInCurrentLayer >= 120000) { // 2 minutes in Void Nexus
          unlockUpgrade('warpConduitRelay');
        }
        if (currentLayer >= 8 && timeInCurrentLayer >= 180000) { // 3 minutes in Quantum Anomaly
          unlockUpgrade('naniteBloom');
        }
      },

      checkCannonUnlocks: () => {
        const { cannonProgress, unlockUpgrade } = get();
        const cannons = Object.values(cannonProgress);
        
        // Platform weapon mastery unlocks
        if (cannons.length >= 2) {
          unlockUpgrade('ionStabilizerCore'); // Basic multi-cannon operation
        }
        
        if (cannons.length >= 4) {
          unlockUpgrade('quantumCapacitor'); // Advanced energy distribution
        }
        
        // Arc Lens Projector - Fully upgrade a long-range cannon
        const hasFullyUpgradedCannon = cannons.some(cannon => cannon.tier >= 5);
        if (hasFullyUpgradedCannon) {
          unlockUpgrade('arcLensProjector');
        }
        
        // Advanced cannon coordination
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
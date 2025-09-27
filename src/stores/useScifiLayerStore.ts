import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SCIFI_LAYERS, SCIFI_UPGRADES, SciFiUpgrade, checkUnlockCondition, getLayerByAltitude } from '@/data/SciFiUpgradeSystem';

interface ScifiLayerState {
  // Core layer tracking
  altitude: number;
  currentLayer: number;
  highestLayer: number;
  timeInCurrentLayer: number;
  
  // Enhanced progress tracking
  meteorsDestroyed: number;
  unlockedUpgrades: string[];
  cannonProgress: Record<string, { tier: number; abilities: string[] }>;
  defeatedBosses: string[];
  nexusInventory: string[]; // Relic IDs available in Nexus
  
  // Layer enter timestamps
  layerEnterTime: number;
  
  // Upgrade system
  availableUpgrades: Record<string, SciFiUpgrade>;
  
  // Actions
  updateAltitude: (newAltitude: number) => void;
  enterLayer: (layerNumber: number) => void;
  updateTimeInLayer: (deltaTime: number) => void;
  destroyMeteor: () => void;
  defeatBoss: (bossId: string) => void;
  unlockUpgrade: (upgradeId: string) => void;
  updateCannonProgress: (cannonId: string, tier: number, abilities: string[]) => void;
  
  // Enhanced unlock checking methods
  checkAllUnlocks: () => void;
  checkLayerUnlocks: (layerNumber: number) => void;
  checkMeteorUnlocks: () => void;
  checkTimeBasedUnlocks: () => void;
  checkCannonUnlocks: () => void;
  checkBossUnlocks: () => void;
  
  // Relic management
  addRelicToNexus: (relicId: string) => void;
  getUnlockedRelics: () => SciFiUpgrade[];
  
  // Dev utilities
  teleportToLayer: (layerNumber: number) => void;
  resetProgress: () => void;
  unlockAllUpgrades: () => void;
  placeRelicTest: (relicId: string) => void;
  toggleDebugMode: () => void;
  debugMode: boolean;
}

const LAYER_ALTITUDE_THRESHOLD = 30; // Each layer = 30 altitude units (very close!)

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
      defeatedBosses: [],
      nexusInventory: [],
      layerEnterTime: Date.now(),
      availableUpgrades: SCIFI_UPGRADES,
      debugMode: false,

      // Enhanced altitude tracking with layer system
      updateAltitude: (newAltitude: number) => {
        const layerData = getLayerByAltitude(newAltitude);
        const newLayerNum = layerData.id;
        const state = get();
        
        set({ altitude: newAltitude });
        
        // Check if we've entered a new layer
        if (newLayerNum > state.currentLayer) {
          get().enterLayer(newLayerNum);
        }
      },

      // Enhanced layer entry with unlock checking
      enterLayer: (layerNumber: number) => {
        const state = get();
        const now = Date.now();
        
        set({
          currentLayer: layerNumber,
          highestLayer: Math.max(state.highestLayer, layerNumber),
          timeInCurrentLayer: 0,
          layerEnterTime: now
        });

        // Enhanced layer entry logging
        const layerData = SCIFI_LAYERS[layerNumber];
        console.log(`🌌 Entered ${layerData?.name || `Layer ${layerNumber}`}!`);
        
        // Check all unlock conditions
        get().checkLayerUnlocks(layerNumber);
        get().checkAllUnlocks();
      },

      // Enhanced time tracking
      updateTimeInLayer: (deltaTime: number) => {
        set((state) => ({
          timeInCurrentLayer: state.timeInCurrentLayer + deltaTime
        }));
        
        // Check time-based unlocks
        get().checkTimeBasedUnlocks();
      },

      // Enhanced meteor destruction tracking
      destroyMeteor: () => {
        set((state) => ({
          meteorsDestroyed: state.meteorsDestroyed + 1
        }));
        
        // Check meteor-based unlocks
        get().checkMeteorUnlocks();
        get().checkAllUnlocks();
      },

      // Boss defeat tracking
      defeatBoss: (bossId: string) => {
        set((state) => {
          if (!state.defeatedBosses.includes(bossId)) {
            console.log(`🏆 Defeated boss: ${bossId}`);
            return {
              defeatedBosses: [...state.defeatedBosses, bossId]
            };
          }
          return state;
        });
        
        get().checkBossUnlocks();
        get().checkAllUnlocks();
      },

      // Enhanced upgrade unlocking with relic support
      unlockUpgrade: (upgradeId: string) => {
        const state = get();
        const upgrade = SCIFI_UPGRADES[upgradeId];
        
        if (!upgrade || state.unlockedUpgrades.includes(upgradeId)) {
          return;
        }

        console.log(`🔓 Unlocked upgrade: ${upgrade.name}`);
        
        set((prevState) => ({
          unlockedUpgrades: [...prevState.unlockedUpgrades, upgradeId]
        }));

        // If it's a relic, add to Nexus inventory
        if (upgrade.type === 'relic') {
          get().addRelicToNexus(upgradeId);
        }
      },

      // Enhanced cannon progress tracking
      updateCannonProgress: (cannonId: string, tier: number, abilities: string[]) => {
        set((state) => ({
          cannonProgress: {
            ...state.cannonProgress,
            [cannonId]: { tier, abilities }
          }
        }));
        
        // Check cannon-based unlocks
        get().checkCannonUnlocks();
        get().checkAllUnlocks();
      },

      // Comprehensive unlock checking
      checkAllUnlocks: () => {
        const state = get();
        const gameState = {
          meteorsDestroyed: state.meteorsDestroyed,
          currentLayer: state.currentLayer,
          timeInCurrentLayer: state.timeInCurrentLayer,
          cannonProgress: state.cannonProgress,
          defeatedBosses: state.defeatedBosses
        };

        // Check all upgrades for unlock conditions
        Object.values(SCIFI_UPGRADES).forEach(upgrade => {
          if (!state.unlockedUpgrades.includes(upgrade.id) && 
              checkUnlockCondition(upgrade, gameState)) {
            get().unlockUpgrade(upgrade.id);
          }
        });
      },

      // Layer-specific unlocks
      checkLayerUnlocks: (layerNumber: number) => {
        const layerData = SCIFI_LAYERS[layerNumber];
        if (layerData?.unlocks) {
          layerData.unlocks.forEach(upgradeId => {
            get().unlockUpgrade(upgradeId);
          });
        }
      },

      // Meteor-based unlocks
      checkMeteorUnlocks: () => {
        const { meteorsDestroyed } = get();
        
        if (meteorsDestroyed >= 100) {
          get().unlockUpgrade('ionStabilizerCore');
        }
        if (meteorsDestroyed >= 500) {
          get().unlockUpgrade('quantumCapacitor');
        }
      },

      // Time-based unlocks
      checkTimeBasedUnlocks: () => {
        const { currentLayer, timeInCurrentLayer } = get();
        
        // Gravity Anchor Array - Survive 2 minutes in Solar Wind Zone
        if (currentLayer >= 3 && timeInCurrentLayer >= 120000) {
          get().unlockUpgrade('gravityAnchorArray');
        }
      },

      // Cannon-based unlocks
      checkCannonUnlocks: () => {
        const { cannonProgress } = get();
        const cannons = Object.values(cannonProgress);
        
        // Arc Lens Projector - Fully upgrade any cannon
        const hasFullyUpgradedCannon = cannons.some(cannon => cannon.tier >= 5);
        if (hasFullyUpgradedCannon) {
          get().unlockUpgrade('arcLensProjector');
        }
        
        // Nanite Bloom - Max out any cannon's ability tree
        const hasMaxAbilities = cannons.some(cannon => cannon.abilities.length >= 5);
        if (hasMaxAbilities) {
          get().unlockUpgrade('naniteBloom');
        }
      },

      // Boss-based unlocks
      checkBossUnlocks: () => {
        const { defeatedBosses } = get();
        
        if (defeatedBosses.includes('gravity_nexus')) {
          get().unlockUpgrade('warpConduitRelay');
        }
      },

      // Relic management for Nexus integration
      addRelicToNexus: (relicId: string) => {
        const upgrade = SCIFI_UPGRADES[relicId];
        if (upgrade?.type === 'relic') {
          set((state) => {
            if (!state.nexusInventory.includes(relicId)) {
              console.log(`✨ Relic "${upgrade.name}" added to Nexus inventory!`);
              return {
                nexusInventory: [...state.nexusInventory, relicId]
              };
            }
            return state;
          });
        }
      },

      getUnlockedRelics: () => {
        const state = get();
        return state.nexusInventory.map(id => SCIFI_UPGRADES[id]).filter(Boolean);
      },

      // Enhanced dev utilities
      teleportToLayer: (layerNumber: number) => {
        const layerData = SCIFI_LAYERS[layerNumber];
        if (!layerData) return;
        
        const newAltitude = layerData.altitudeThreshold;
        set({
          altitude: newAltitude,
          currentLayer: layerNumber,
          highestLayer: Math.max(get().highestLayer, layerNumber),
          timeInCurrentLayer: 0,
          layerEnterTime: Date.now()
        });
        console.log(`🚀 Teleported to ${layerData.name} (Layer ${layerNumber})`);
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
          defeatedBosses: [],
          nexusInventory: [],
          layerEnterTime: Date.now()
        });
        console.log('🔄 All Sci-Fi progress reset');
      },

      unlockAllUpgrades: () => {
        const allUpgradeIds = Object.keys(SCIFI_UPGRADES);
        set({ 
          unlockedUpgrades: allUpgradeIds,
          nexusInventory: allUpgradeIds.filter(id => SCIFI_UPGRADES[id].type === 'relic')
        });
        console.log('🎯 All Sci-Fi upgrades unlocked');
      },

      placeRelicTest: (relicId: string) => {
        const upgrade = SCIFI_UPGRADES[relicId];
        if (upgrade?.type === 'relic') {
          get().unlockUpgrade(relicId);
          console.log(`🧪 Test placed relic: ${upgrade.name}`);
        }
      },

      toggleDebugMode: () => {
        set((state) => ({ debugMode: !state.debugMode }));
        console.log(`🔧 Debug mode: ${!get().debugMode ? 'ON' : 'OFF'}`);
      }
    }),
    {
      name: 'scifi-layer-storage',
      version: 2 // Increased version for major changes
    }
  )
);
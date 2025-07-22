
import { useEffect, useRef } from 'react';
import { useMapEditorStore } from '../stores/useMapEditorStore';
import { useBuffSystem } from './CrossRealmBuffSystem';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { GameState, fantasyBuildings, scifiBuildings } from './GameStateManager';

interface GameLoopManagerProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  stableFantasyBuildings: { [key: string]: number };
  stableScifiBuildings: { [key: string]: number };
  stablePurchasedUpgrades: string[];
  crossRealmUpgradesWithLevels: any[];
}

export const useGameLoopManager = ({
  gameState,
  setGameState,
  stableFantasyBuildings,
  stableScifiBuildings,
  stablePurchasedUpgrades,
  crossRealmUpgradesWithLevels
}: GameLoopManagerProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const buffSystem = useBuffSystem(stableFantasyBuildings, stableScifiBuildings);
  const purchasedUpgradesCount = stablePurchasedUpgrades.length;
  const isEditorActive = useMapEditorStore((state) => state.isEditorActive);

  // PERFORMANCE FIX: Slower game loop to reduce CPU usage
  useEffect(() => {
    if (isEditorActive) return;
    
    console.log('🎮 Starting optimized game loop');
    intervalRef.current = setInterval(() => {
      setGameState(prev => {
        const deltaTime = 0.5; // INCREASED: 500ms intervals instead of 100ms for 80% less CPU usage
        const autoManaGain = prev.autoManaRate * deltaTime;
        
        const newState = {
          ...prev,
          mana: prev.mana + (prev.manaPerSecond * deltaTime) + autoManaGain,
          energyCredits: prev.energyCredits + prev.energyPerSecond * deltaTime,
          lastSaveTime: Date.now(),
        };
        
        // PERFORMANCE FIX: Save less frequently
        if (Date.now() - prev.lastSaveTime > 5000) { // Save every 5 seconds instead of every update
          localStorage.setItem('celestialNexusGame', JSON.stringify(newState));
        }
        return newState;
      });
    }, 500); // PERFORMANCE FIX: 500ms instead of 100ms

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setGameState, isEditorActive]);

  // Enhanced production calculation with cross-realm upgrades - PERFORMANCE FIX
  useEffect(() => {
    if (isEditorActive) return;
    
    console.log('⚡ Calculating production rates (performance optimized)');
    let manaRate = 0;
    let energyRate = 0;
    let manaPerKill = 5;

    // Base production from buildings
    fantasyBuildings.forEach(building => {
      const count = stableFantasyBuildings[building.id] || 0;
      if (count > 0) {
        const { multiplier, flatBonus } = buffSystem.calculateBuildingMultiplier(building.id, 'fantasy');
        manaRate += (count * building.production * multiplier) + flatBonus;
      }
    });

    scifiBuildings.forEach(building => {
      const count = stableScifiBuildings[building.id] || 0;
      if (count > 0) {
        const { multiplier, flatBonus } = buffSystem.calculateBuildingMultiplier(building.id, 'scifi');
        energyRate += (count * building.production * multiplier) + flatBonus;
      }
    });

    // Apply cross-realm upgrade bonuses
    crossRealmUpgradesWithLevels.forEach(upgrade => {
      if (upgrade.level > 0) {
        if (upgrade.effect.manaPerSecond && upgrade.realm === 'fantasy') {
          manaRate += upgrade.effect.manaPerSecond * upgrade.level;
        }
        if (upgrade.effect.energyPerSecond && upgrade.realm === 'scifi') {
          energyRate += upgrade.effect.energyPerSecond * upgrade.level;
        }
        if (upgrade.effect.manaPerKill) {
          manaPerKill += upgrade.effect.manaPerKill * upgrade.level;
        }
      }
    });

    // Apply hybrid upgrade bonuses
    let globalMultiplier = 1;
    stablePurchasedUpgrades.forEach(upgradeId => {
      const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
      if (upgrade) {
        if (upgrade.effects.globalProductionBonus) {
          globalMultiplier *= (1 + upgrade.effects.globalProductionBonus);
        }
        if (upgrade.effects.manaProductionBonus) {
          manaRate += upgrade.effects.manaProductionBonus;
        }
        if (upgrade.effects.energyProductionBonus) {
          energyRate += upgrade.effects.energyProductionBonus;
        }
      }
    });

    // Cross-realm bonuses
    const fantasyBonus = 1 + (energyRate * 0.01);
    const scifiBonus = 1 + (manaRate * 0.01);

    const finalManaRate = manaRate * fantasyBonus * globalMultiplier;
    const finalEnergyRate = energyRate * scifiBonus * globalMultiplier;

    // CRITICAL FIX: Only update if rates actually changed to prevent infinite loops
    setGameState(prev => {
      if (Math.abs(prev.manaPerSecond - finalManaRate) < 0.001 && 
          Math.abs(prev.energyPerSecond - finalEnergyRate) < 0.001 && 
          prev.manaPerKill === manaPerKill) {
        return prev; // No change, return same state
      }
      
      return {
        ...prev,
        manaPerSecond: finalManaRate,
        energyPerSecond: finalEnergyRate,
        manaPerKill,
      };
    });
  }, [
    // PERFORMANCE FIX: Much more stable dependencies
    JSON.stringify(stableFantasyBuildings),
    JSON.stringify(stableScifiBuildings), 
    purchasedUpgradesCount,
    crossRealmUpgradesWithLevels.length,
    isEditorActive
  ]);

  return { buffSystem };
};

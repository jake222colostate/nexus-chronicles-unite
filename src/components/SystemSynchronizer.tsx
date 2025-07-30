import { useEffect } from 'react';
import { useGameStateStore } from '@/stores/useGameStateStore';
import { useAutoManaStore } from '@/stores/useAutoManaStore';
import { useAutoEnergyStore } from '@/stores/useAutoEnergyStore';

interface SystemSynchronizerProps {
  gameState: any;
  setGameState: (updater: (prev: any) => any) => void;
}

/**
 * Centralized system to ensure all game mechanics stay synchronized
 * This component handles the integration between:
 * - Global Zustand stores
 * - Local game state
 * - Auto-generation systems
 * - Cross-realm mechanics
 */
export const SystemSynchronizer: React.FC<SystemSynchronizerProps> = ({
  gameState,
  setGameState
}) => {
  const globalGameState = useGameStateStore();
  const autoManaStore = useAutoManaStore();
  const autoEnergyStore = useAutoEnergyStore();

  // Sync global state with local state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Update global state with local changes
      if (gameState.mana !== globalGameState.mana) {
        const diff = gameState.mana - globalGameState.mana;
        if (diff > 0) {
          globalGameState.addMana(diff);
        }
      }

      if (gameState.energyCredits !== globalGameState.energyCredits) {
        const diff = gameState.energyCredits - globalGameState.energyCredits;
        if (diff > 0) {
          globalGameState.addEnergy(diff);
        }
      }

      // Sync production rates
      const totalManaPerSecond = (gameState.manaPerSecond || 0) + autoManaStore.manaPerSecond;
      const totalEnergyPerSecond = (gameState.energyPerSecond || 0) + autoEnergyStore.energyPerSecond;

      if (totalManaPerSecond !== globalGameState.manaPerSecond) {
        globalGameState.setManaPerSecond(totalManaPerSecond);
      }

      if (totalEnergyPerSecond !== globalGameState.energyPerSecond) {
        globalGameState.setEnergyPerSecond(totalEnergyPerSecond);
      }
    }, 1000); // Sync every second

    return () => clearInterval(interval);
  }, [gameState, globalGameState, autoManaStore, autoEnergyStore]);

  // Ensure local state reflects global state changes
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      nexusShards: globalGameState.nexusShards,
    }));
  }, [globalGameState.nexusShards, setGameState]);

  return null; // This is a logic-only component
};
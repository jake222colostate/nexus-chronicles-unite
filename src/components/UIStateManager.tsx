
import { useState, useCallback, useMemo } from 'react';

interface GameState {
  mana: number;
  energyCredits: number;
  nexusShards: number;
  manaPerSecond: number;
  energyPerSecond: number;
  fantasyJourneyDistance: number;
  scifiJourneyDistance: number;
  convergenceCount: number;
  fantasyBuildings: { [key: string]: number };
  scifiBuildings: { [key: string]: number };
  manaPerKill: number;
}

interface UseUIStateManagerProps {
  gameState: GameState;
}

export const useUIStateManager = (gameState: GameState) => {
  const [currentRealm, setCurrentRealm] = useState<'fantasy' | 'scifi'>('fantasy');
  const [showConvergence, setShowConvergence] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [showCombatUpgrades, setShowCombatUpgrades] = useState(false);
  const [showWeaponUpgrades, setShowWeaponUpgrades] = useState(false);
  const [showCrossRealmUpgrades, setShowCrossRealmUpgrades] = useState(false);
  const [showCannonUpgrades, setShowCannonUpgrades] = useState(false);

  const playerPosition = useMemo(() => ({
    x: 0,
    y: 1.7,
    z: currentRealm === 'fantasy' ? -gameState.fantasyJourneyDistance : -gameState.scifiJourneyDistance
  }), [currentRealm, gameState.fantasyJourneyDistance, gameState.scifiJourneyDistance]);

  const currentJourneyDistance = useMemo(() => {
    return currentRealm === 'fantasy' ? gameState.fantasyJourneyDistance : gameState.scifiJourneyDistance;
  }, [currentRealm, gameState.fantasyJourneyDistance, gameState.scifiJourneyDistance]);

  // Significantly delay convergence availability - require much more progression
  const canConverge = useMemo(() => {
    const minFantasyDistance = 500; // Increased from lower values
    const minScifiDistance = 500;   // Increased from lower values
    const minMana = 10000;          // Increased significantly
    const minEnergy = 10000;        // Increased significantly
    
    return gameState.fantasyJourneyDistance >= minFantasyDistance &&
           gameState.scifiJourneyDistance >= minScifiDistance &&
           gameState.mana >= minMana &&
           gameState.energyCredits >= minEnergy;
  }, [gameState.fantasyJourneyDistance, gameState.scifiJourneyDistance, gameState.mana, gameState.energyCredits]);

  const convergenceProgress = useMemo(() => {
    const fantasyProgress = Math.min(100, (gameState.fantasyJourneyDistance / 500) * 100);
    const scifiProgress = Math.min(100, (gameState.scifiJourneyDistance / 500) * 100);
    const manaProgress = Math.min(100, (gameState.mana / 10000) * 100);
    const energyProgress = Math.min(100, (gameState.energyCredits / 10000) * 100);
    
    return Math.min(100, (fantasyProgress + scifiProgress + manaProgress + energyProgress) / 4);
  }, [gameState.fantasyJourneyDistance, gameState.scifiJourneyDistance, gameState.mana, gameState.energyCredits]);

  const switchRealm = useCallback((targetRealm?: 'fantasy' | 'scifi') => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (targetRealm) {
        setCurrentRealm(targetRealm);
      } else {
        setCurrentRealm(prev => prev === 'fantasy' ? 'scifi' : 'fantasy');
      }
      setIsTransitioning(false);
    }, 500);
  }, []);

  return {
    currentRealm,
    showConvergence,
    isTransitioning,
    showTapEffect,
    showQuickHelp,
    showCombatUpgrades,
    showWeaponUpgrades,
    showCrossRealmUpgrades,
    showCannonUpgrades,
    playerPosition,
    currentJourneyDistance,
    canConverge,
    convergenceProgress,
    setShowConvergence,
    setShowTapEffect,
    setShowQuickHelp,
    setShowCombatUpgrades,
    setShowWeaponUpgrades,
    setShowCrossRealmUpgrades,
    setShowCannonUpgrades,
    switchRealm
  };
};

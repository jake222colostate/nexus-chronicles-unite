
import { useState, useCallback, useMemo } from 'react';
import { GameState } from './GameStateManager';

export const useUIStateManager = (gameState: GameState) => {
  const [currentRealm, setCurrentRealm] = useState<'fantasy' | 'scifi'>('fantasy');
  const [showConvergence, setShowConvergence] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(() => {
    return !localStorage.getItem('celestialNexusHelpDismissed');
  });
  const [showCombatUpgrades, setShowCombatUpgrades] = useState(false);
  const [showWeaponUpgrades, setShowWeaponUpgrades] = useState(false);
  const [showCrossRealmUpgrades, setShowCrossRealmUpgrades] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1.6, z: 0 });

  // Current journey distance calculation
  const currentJourneyDistance = useMemo(() => {
    return currentRealm === 'fantasy' 
      ? gameState.fantasyJourneyDistance 
      : gameState.scifiJourneyDistance;
  }, [currentRealm, gameState.fantasyJourneyDistance, gameState.scifiJourneyDistance]);

  // Enhanced realm switching with proper visual feedback
  const switchRealm = useCallback((newRealm: 'fantasy' | 'scifi') => {
    if (newRealm === currentRealm || isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentRealm(newRealm);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  }, [currentRealm, isTransitioning]);

  const canConverge = gameState.mana + gameState.energyCredits >= 1000;
  const convergenceProgress = Math.min(((gameState.mana + gameState.energyCredits) / 1000) * 100, 100);

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  }, []);

  return {
    // State
    currentRealm,
    showConvergence,
    isTransitioning,
    showTapEffect,
    showQuickHelp,
    showCombatUpgrades,
    showWeaponUpgrades,
    showCrossRealmUpgrades,
    playerPosition,
    currentJourneyDistance,
    canConverge,
    convergenceProgress,
    
    // Setters
    setCurrentRealm,
    setShowConvergence,
    setIsTransitioning,
    setShowTapEffect,
    setShowQuickHelp,
    setShowCombatUpgrades,
    setShowWeaponUpgrades,
    setShowCrossRealmUpgrades,
    setPlayerPosition,
    
    // Functions
    switchRealm,
    formatNumber
  };
};

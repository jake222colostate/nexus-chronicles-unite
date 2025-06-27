
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Vector3 } from 'three';
import { enhancedHybridUpgrades } from '../../data/EnhancedHybridUpgrades';

interface UseFantasy3DUpgradeWorldProps {
  gameState: any;
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
}

export const useFantasy3DUpgradeWorld = ({ 
  gameState, 
  onPlayerPositionUpdate 
}: UseFantasy3DUpgradeWorldProps) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 5, 12));
  const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [lastPurchaseTime, setLastPurchaseTime] = useState(0);
  const currentManaRef = useRef(gameState?.mana || 0);

  // Stable purchase processing to prevent multiple calls
  const [processingPurchases, setProcessingPurchases] = useState(new Set<string>());

  // Update current mana ref when gameState changes
  useEffect(() => {
    if (gameState?.mana !== undefined) {
      currentManaRef.current = gameState.mana;
    }
  }, [gameState?.mana]);

  // Configuration constants
  const CHUNK_SIZE = 100;
  const RENDER_DISTANCE = 200;
  const UPGRADE_SPACING = 15;

  // Calculate max unlocked upgrade tier
  const maxUnlockedUpgrade = useMemo(() => {
    if (!gameState) return 0;
    
    const mana = gameState.mana || 0;
    const energyCredits = gameState.energyCredits || 0;
    const nexusShards = gameState.nexusShards || 0;
    const convergenceCount = gameState.convergenceCount || 0;
    
    let maxTier = 0;
    
    for (const upgrade of enhancedHybridUpgrades) {
      const { requirements } = upgrade;
      
      let canUnlock = true;
      if (requirements.mana && mana < requirements.mana) canUnlock = false;
      if (requirements.energy && energyCredits < requirements.energy) canUnlock = false;
      if (requirements.nexusShards && nexusShards < requirements.nexusShards) canUnlock = false;
      if (requirements.convergenceCount && convergenceCount < requirements.convergenceCount) canUnlock = false;
      
      if (canUnlock) {
        maxTier = Math.max(maxTier, upgrade.tier);
      }
    }
    
    return maxTier;
  }, [gameState]);

  // Generate upgrade positions in a spiral pattern
  const upgrades = useMemo(() => {
    const positions = [];
    const totalUpgrades = enhancedHybridUpgrades.length;
    
    for (let i = 0; i < totalUpgrades; i++) {
      const angle = (i / totalUpgrades) * Math.PI * 4;
      const radius = 5 + Math.floor(i / 8) * UPGRADE_SPACING;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(i * 0.5) * 2;
      
      const upgrade = enhancedHybridUpgrades[i];
      const { requirements } = upgrade;
      
      let unlocked = true;
      if (gameState) {
        if (requirements.mana && gameState.mana < requirements.mana) unlocked = false;
        if (requirements.energy && gameState.energyCredits < requirements.energy) unlocked = false;
        if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) unlocked = false;
        if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) unlocked = false;
      }
      
      positions.push({
        ...upgrade,
        position: [x, y, z],
        unlocked,
        tier: upgrade.tier
      });
    }
    
    return positions;
  }, [gameState, UPGRADE_SPACING]);

  // Purchased upgrades set for quick lookup
  const purchasedUpgrades = useMemo(() => {
    return new Set(gameState?.purchasedUpgrades || []);
  }, [gameState?.purchasedUpgrades]);

  // Stable position change handler
  const handlePositionChange = useCallback((newPosition: Vector3) => {
    setCameraPosition(newPosition);
    
    if (onPlayerPositionUpdate) {
      onPlayerPositionUpdate({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z
      });
    }
  }, [onPlayerPositionUpdate]);

  // Stable upgrade click handler with duplicate prevention
  const handleUpgradeClick = useCallback((upgrade: any) => {
    const now = Date.now();
    
    // Prevent rapid clicks and duplicate processing
    if (processingPurchases.has(upgrade.id) || now - lastPurchaseTime < 1000) {
      console.log('Upgrade click blocked - processing or too soon');
      return;
    }

    if (!upgrade.unlocked) {
      console.log('Upgrade not unlocked');
      return;
    }

    if (purchasedUpgrades.has(upgrade.id)) {
      console.log('Upgrade already purchased');
      return;
    }

    if (currentManaRef.current < upgrade.cost) {
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
      return;
    }

    // Mark as processing
    setProcessingPurchases(prev => new Set([...prev, upgrade.id]));
    setLastPurchaseTime(now);
    
    console.log('Opening upgrade modal for:', upgrade.name);
    setSelectedUpgrade(upgrade);
  }, [processingPurchases, lastPurchaseTime, purchasedUpgrades]);

  // Stable upgrade purchase handler
  const handleUpgradePurchase = useCallback((upgrade: any) => {
    console.log('Purchasing upgrade:', upgrade.name);
    
    // Additional safety check
    if (purchasedUpgrades.has(upgrade.id) || currentManaRef.current < upgrade.cost) {
      console.log('Purchase blocked - already owned or insufficient funds');
      setProcessingPurchases(prev => {
        const newSet = new Set(prev);
        newSet.delete(upgrade.id);
        return newSet;
      });
      return;
    }

    // Close modal and clear processing
    setSelectedUpgrade(null);
    setProcessingPurchases(prev => {
      const newSet = new Set(prev);
      newSet.delete(upgrade.id);
      return newSet;
    });
  }, [purchasedUpgrades]);

  // Tier progression handler
  const handleTierProgression = useCallback((tier: number) => {
    console.log('Tier progression:', tier);
  }, []);

  return {
    cameraPosition,
    selectedUpgrade,
    showInsufficientMana,
    maxUnlockedUpgrade,
    currentManaRef,
    upgrades,
    purchasedUpgrades,
    CHUNK_SIZE,
    RENDER_DISTANCE,
    UPGRADE_SPACING,
    handlePositionChange,
    handleUpgradeClick,
    handleUpgradePurchase,
    handleTierProgression,
    setSelectedUpgrade
  };
};

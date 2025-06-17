
import { useState, useCallback, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useInfiniteUpgrades } from '../InfiniteUpgradeSystem';

interface UseFantasy3DUpgradeWorldProps {
  gameState?: any;
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
}

export const useFantasy3DUpgradeWorld = ({
  gameState,
  onPlayerPositionUpdate
}: UseFantasy3DUpgradeWorldProps) => {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(0, 1.6, 0));
  const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [maxUnlockedUpgrade, setMaxUnlockedUpgrade] = useState(-1);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<Set<number>>(new Set());
  
  // Use refs for values that don't need to trigger re-renders
  const currentManaRef = useRef(gameState?.mana || 100);
  const totalManaPerSecondRef = useRef(gameState?.manaPerSecond || 0);
  
  // Enhanced ref to prevent double purchases with stricter locking
  const isPurchasingRef = useRef(false);
  const lastPurchaseTimeRef = useRef(0);
  
  // Enhanced infinite world parameters
  const CHUNK_SIZE = 80;
  const RENDER_DISTANCE = 200;
  const UPGRADE_SPACING = 35;

  // Get dynamic upgrades based on player position
  const upgrades = useInfiniteUpgrades({
    maxUnlockedUpgrade,
    playerPosition: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
    upgradeSpacing: UPGRADE_SPACING,
    renderDistance: RENDER_DISTANCE
  });

  // Update refs when gameState changes - no state updates to prevent loops
  useEffect(() => {
    if (gameState) {
      currentManaRef.current = gameState.mana;
      totalManaPerSecondRef.current = gameState.manaPerSecond;
    }
  }, [gameState?.mana, gameState?.manaPerSecond]);

  const handlePositionChange = useCallback((position: Vector3) => {
    setCameraPosition(position);
    if (onPlayerPositionUpdate) {
      onPlayerPositionUpdate({
        x: position.x,
        y: position.y,
        z: position.z
      });
    }
  }, [onPlayerPositionUpdate]);

  const handleUpgradeClick = useCallback((upgrade: any) => {
    // Prevent multiple clicks during purchase process with enhanced checks
    if (isPurchasingRef.current) {
      console.log('Purchase already in progress, ignoring click');
      return;
    }
    
    // Prevent rapid clicking with time-based check
    const now = Date.now();
    if (now - lastPurchaseTimeRef.current < 1000) {
      console.log('Too soon after last purchase attempt, ignoring click');
      return;
    }
    
    console.log(`Clicked upgrade: ${upgrade.name}`);
    
    const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
    console.log(`Distance to ${upgrade.name}: ${distance.toFixed(2)}`);
    
    if (distance > 15) {
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: any) => {
    const now = Date.now();
    
    // Enhanced purchase prevention with multiple checks
    if (isPurchasingRef.current) {
      console.log('Purchase already in progress, blocking duplicate purchase');
      return;
    }
    
    // Time-based check to prevent rapid purchases
    if (now - lastPurchaseTimeRef.current < 2000) {
      console.log('Too soon after last purchase, blocking rapid purchase');
      return;
    }
    
    // Check if already purchased
    if (purchasedUpgrades.has(upgrade.id)) {
      console.log('Upgrade already purchased, blocking duplicate purchase');
      setSelectedUpgrade(null);
      return;
    }
    
    console.log(`Attempting to purchase ${upgrade.name} for ${upgrade.cost} mana. Current mana: ${currentManaRef.current}`);

    if (currentManaRef.current >= upgrade.cost) {
      // Set purchasing flag to prevent multiple purchases with immediate effect
      isPurchasingRef.current = true;
      lastPurchaseTimeRef.current = now;
      
      currentManaRef.current -= upgrade.cost;
      totalManaPerSecondRef.current += upgrade.manaPerSecond;
      setMaxUnlockedUpgrade(prev => Math.max(prev, upgrade.id));
      setPurchasedUpgrades(prev => {
        const next = new Set(prev);
        next.add(upgrade.id);
        return next;
      });
      setSelectedUpgrade(null);
      console.log(`Unlocked ${upgrade.name}! +${upgrade.manaPerSecond} mana/sec`);
      
      // Extended timeout to ensure no rapid purchases
      setTimeout(() => {
        isPurchasingRef.current = false;
      }, 2000);
    } else {
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
      console.log("Not enough mana!");
    }
  }, [purchasedUpgrades]);

  const handleTierProgression = useCallback(() => {
    console.log("Tier progression triggered!");
    // Add tier progression logic here
  }, []);

  return {
    cameraPosition,
    selectedUpgrade,
    showInsufficientMana,
    maxUnlockedUpgrade,
    currentManaRef,
    upgrades,
    CHUNK_SIZE,
    RENDER_DISTANCE,
    UPGRADE_SPACING,
    handlePositionChange,
    handleUpgradeClick,
    handleUpgradePurchase,
    handleTierProgression,
    setSelectedUpgrade,
    purchasedUpgrades
  };
};

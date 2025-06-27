
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
  
  // COMPLETELY NEW purchase protection system
  const activePurchaseRef = useRef<string | null>(null);
  const purchaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Update refs when gameState changes
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
    // Create unique purchase identifier
    const purchaseId = `${upgrade.id}-${Date.now()}`;
    
    console.log(`Purchase attempt for ${upgrade.name} with ID: ${purchaseId}`);
    
    // STRICT: Only allow one purchase at a time globally
    if (activePurchaseRef.current !== null) {
      console.log(`Purchase blocked - another purchase active: ${activePurchaseRef.current}`);
      return;
    }
    
    // Check if already purchased
    if (purchasedUpgrades.has(upgrade.id)) {
      console.log(`Purchase blocked - upgrade ${upgrade.id} already owned`);
      setSelectedUpgrade(null);
      return;
    }
    
    // Check mana
    if (currentManaRef.current < upgrade.cost) {
      console.log(`Purchase blocked - insufficient mana: ${currentManaRef.current} < ${upgrade.cost}`);
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
      return;
    }
    
    // Lock the purchase system
    activePurchaseRef.current = purchaseId;
    console.log(`Purchase locked with ID: ${purchaseId}`);
    
    // Clear any existing timeout
    if (purchaseTimeoutRef.current) {
      clearTimeout(purchaseTimeoutRef.current);
    }
    
    try {
      // Perform the purchase immediately
      currentManaRef.current -= upgrade.cost;
      totalManaPerSecondRef.current += upgrade.manaPerSecond;
      setMaxUnlockedUpgrade(prev => Math.max(prev, upgrade.id));
      setPurchasedUpgrades(prev => {
        const next = new Set(prev);
        next.add(upgrade.id);
        return next;
      });
      setSelectedUpgrade(null);
      
      console.log(`SUCCESS: Purchased ${upgrade.name}! +${upgrade.manaPerSecond} mana/sec`);
      console.log(`New mana: ${currentManaRef.current}, New mana/sec: ${totalManaPerSecondRef.current}`);
      
    } catch (error) {
      console.error(`Purchase failed for ${upgrade.name}:`, error);
    } finally {
      // Release the lock after a delay to prevent rapid clicking
      purchaseTimeoutRef.current = setTimeout(() => {
        activePurchaseRef.current = null;
        console.log(`Purchase lock released for ID: ${purchaseId}`);
      }, 1000); // 1 second cooldown
    }
  }, [purchasedUpgrades]);

  const handleTierProgression = useCallback(() => {
    console.log("Tier progression triggered!");
    // Add tier progression logic here
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (purchaseTimeoutRef.current) {
        clearTimeout(purchaseTimeoutRef.current);
      }
    };
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

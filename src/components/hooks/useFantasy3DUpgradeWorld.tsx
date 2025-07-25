
import { useState, useCallback, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useGameStateStore } from '@/stores/useGameStateStore';

interface UseFantasy3DUpgradeWorldProps {
  gameState?: any;
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
}

export const useFantasy3DUpgradeWorld = ({
  gameState,
  onPlayerPositionUpdate
}: UseFantasy3DUpgradeWorldProps) => {
  const globalGameState = useGameStateStore();
  
  // Initialize state with stable references
  const [cameraPosition, setCameraPosition] = useState(() => new Vector3(0, 1.6, 0));
  const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [maxUnlockedUpgrade, setMaxUnlockedUpgrade] = useState(() => 0); // Start with first upgrade unlocked
  const [purchasedUpgrades, setPurchasedUpgrades] = useState(() => new Set<number>());
  
  // Use refs for values that don't need to trigger re-renders
  const currentManaRef = useRef(gameState?.mana || globalGameState.mana || 100);
  const totalManaPerSecondRef = useRef(gameState?.manaPerSecond || globalGameState.manaPerSecond || 0);
  
  // COMPLETELY NEW purchase protection system
  const activePurchaseRef = useRef<string | null>(null);
  const purchaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced infinite world parameters
  const CHUNK_SIZE = 80;
  const RENDER_DISTANCE = 200;
  const UPGRADE_SPACING = 35;

  // Base template for the repeating upgrade sequence
  const upgradeTemplates = [
    {
      name: 'Mana Crystal',
      cost: 50,
      manaPerSecond: 3,
      description: 'A crystallized form of pure magical energy',
      modelType: 'podium' as const
    },
    {
      name: 'Arcane Focus',
      cost: 250,
      manaPerSecond: 12,
      description: 'Concentrates magical energies for greater efficiency',
      modelType: 'podium' as const
    },
    {
      name: 'Mystic Fountain',
      cost: 1000,
      manaPerSecond: 30,
      description: 'An eternal wellspring of magical power',
      modelType: 'podium' as const
    },
    {
      name: 'Elder Artifact',
      cost: 5000,
      manaPerSecond: 100,
      description: 'Ancient relic of immense magical power',
      modelType: 'podium' as const
    },
    {
      name: 'Celestial Nexus',
      cost: 100000,
      manaPerSecond: 1500,
      description: 'Connects to the cosmic web of magical energy',
      modelType: 'obelisk' as const
    }
  ];

  interface UpgradeData {
    id: number;
    name: string;
    cost: number;
    manaPerSecond: number;
    position: [number, number, number];
    tier: number;
    unlocked: boolean;
    description: string;
    modelType: 'podium' | 'obelisk';
  }

  const createUpgrade = (index: number): UpgradeData => {
    const templateIndex = index % upgradeTemplates.length;
    const template = upgradeTemplates[templateIndex];
    
    // Determine model type: first 4 use podium, 5th uses obelisk, then repeat
    const cyclePosition = index % 5;
    const modelType = cyclePosition === 4 ? 'obelisk' : 'podium';
    
    // Obelisks go closer to path center, podiums stay in lanes
    const lane = modelType === 'obelisk' ? 
      (index % 2 === 0 ? -1.5 : 1.5) :  // Obelisks very close to path center
      (index % 2 === 0 ? -12 : 12); // Podiums in outer lanes
    
    return {
      id: index,
      name: template.name,
      cost: template.cost * Math.pow(1.5, Math.floor(index / 5)), // Scale cost by section
      manaPerSecond: template.manaPerSecond * Math.pow(1.3, Math.floor(index / 5)), // Scale power by section  
      description: template.description,
      modelType,
      position: [lane, modelType === 'obelisk' ? 20 : 0, -30 - index * UPGRADE_SPACING], // Obelisks at y=20, podiums at ground level
      tier: templateIndex,
      unlocked: index === 0 || maxUnlockedUpgrade >= index - 1
    };
  };

  const [upgrades, setUpgrades] = useState<UpgradeData[]>(() =>
    Array.from({ length: 10 }).map((_, i) => createUpgrade(i))
  );

  // Extend the upgrade list as the player moves forward
  useEffect(() => {
    setUpgrades(prev => {
      const last = prev[prev.length - 1];
      const distanceAhead = Math.abs(last.position[2] - cameraPosition.z);
      if (distanceAhead < RENDER_DISTANCE) {
        const next: UpgradeData[] = [];
        let index = prev.length;
        for (let i = 0; i < 5; i++) {
          next.push(createUpgrade(index++));
        }
        return [...prev, ...next];
      }
      return prev;
    });
  }, [cameraPosition.z]);

  // Update unlock status when new upgrades are purchased
  useEffect(() => {
    setUpgrades(prev =>
      prev.map(u => ({
        ...u,
        unlocked: u.id === 0 || maxUnlockedUpgrade >= u.id - 1
      }))
    );
  }, [maxUnlockedUpgrade]);

  // Update refs when gameState changes
  useEffect(() => {
    currentManaRef.current = globalGameState.mana;
    totalManaPerSecondRef.current = globalGameState.manaPerSecond;
  }, [globalGameState.mana, globalGameState.manaPerSecond]);

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
      
      // Update global game state
      globalGameState.spendMana(upgrade.cost);
      globalGameState.setManaPerSecond(totalManaPerSecondRef.current);
      
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

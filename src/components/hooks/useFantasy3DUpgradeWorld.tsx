
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
  
  // Use global state as primary source of truth
  const effectiveGameState = {
    ...gameState,
    mana: globalGameState.mana,
    energyCredits: globalGameState.energyCredits,
    nexusShards: globalGameState.nexusShards,
    manaPerSecond: globalGameState.manaPerSecond,
    energyPerSecond: globalGameState.energyPerSecond
  };
  
  // Initialize state with stable references
  const [cameraPosition, setCameraPosition] = useState(() => new Vector3(0, 1.6, 0));
  const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);
  const [showInsufficientMana, setShowInsufficientMana] = useState(false);
  const [maxUnlockedUpgrade, setMaxUnlockedUpgrade] = useState(() => 0); // Start with first upgrade unlocked
  const [purchasedUpgrades, setPurchasedUpgrades] = useState(() => new Set<number>());
  const [unlockedGates, setUnlockedGates] = useState(() => new Set<number>([0])); // First section is unlocked
  
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
    
    // Obelisks go closer to path center, podiums stay in lanes but closer than before
    const lane = modelType === 'obelisk' ? 
      (index % 2 === 0 ? -0.5 : 0.5) :  // Obelisks moved inward by 1 unit
      (index % 2 === 0 ? -8 : 8); // Podiums moved closer to path (was -12/12)
    
    // Check if this upgrade's section is unlocked by gates
    const sectionIndex = Math.floor(index / 5);
    const isSectionUnlocked = unlockedGates.has(sectionIndex);
    
    return {
      id: index,
      name: template.name,
      cost: template.cost * Math.pow(1.5, Math.floor(index / 5)), // Scale cost by section
      manaPerSecond: template.manaPerSecond * Math.pow(1.3, Math.floor(index / 5)), // Scale power by section  
      description: template.description,
      modelType,
      position: [lane, modelType === 'obelisk' ? 50 : 0.4, -30 - index * UPGRADE_SPACING], // Podiums at y=0.4
      tier: templateIndex,
      unlocked: isSectionUnlocked && (index === 0 || maxUnlockedUpgrade >= index - 1)
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

  // Update unlock status when new upgrades are purchased or gates are unlocked
  useEffect(() => {
    setUpgrades(prev =>
      prev.map(u => {
        const sectionIndex = Math.floor(u.id / 5);
        const isSectionUnlocked = unlockedGates.has(sectionIndex);
        return {
          ...u,
          unlocked: isSectionUnlocked && (u.id === 0 || maxUnlockedUpgrade >= u.id - 1)
        };
      })
    );
  }, [maxUnlockedUpgrade, unlockedGates]);

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
    
    if (distance > 25) {
      console.log("Move closer to interact with this upgrade!");
      return;
    }
    
    setSelectedUpgrade(upgrade);
  }, [cameraPosition]);

  const handleUpgradePurchase = useCallback((upgrade: any) => {
    // Simple duplicate check
    if (purchasedUpgrades.has(upgrade.id)) {
      setSelectedUpgrade(null);
      return;
    }
    
    // Check mana
    if (globalGameState.mana < upgrade.cost) {
      setShowInsufficientMana(true);
      setTimeout(() => setShowInsufficientMana(false), 2000);
      return;
    }
    
    // Purchase upgrade
    setPurchasedUpgrades(prev => {
      const next = new Set(prev);
      next.add(upgrade.id);
      return next;
    });
    
    setMaxUnlockedUpgrade(prev => Math.max(prev, upgrade.id));
    setSelectedUpgrade(null);
    
    // Check if we should unlock the next gate section
    const currentSectionIndex = Math.floor(upgrade.id / 5);
    const sectionStart = currentSectionIndex * 5;
    const sectionEnd = sectionStart + 4;
    
    // Count purchased upgrades in current section
    let sectionPurchases = 0;
    for (let i = sectionStart; i <= sectionEnd; i++) {
      if (purchasedUpgrades.has(i) || i === upgrade.id) {
        sectionPurchases++;
      }
    }
    
    // If all 5 upgrades in section are purchased, unlock next gate
    if (sectionPurchases >= 5) {
      setUnlockedGates(prev => {
        const next = new Set(prev);
        next.add(currentSectionIndex + 1);
        return next;
      });
    }
    
    // Update global game state
    globalGameState.spendMana(upgrade.cost);
    globalGameState.setManaPerSecond(globalGameState.manaPerSecond + upgrade.manaPerSecond);
    
    console.log(`Purchased ${upgrade.name}! +${upgrade.manaPerSecond} mana/sec`);
  }, [purchasedUpgrades, globalGameState, unlockedGates]);

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

  // Generate gate data
  const gates = Array.from({ length: Math.ceil(upgrades.length / 5) }, (_, i) => {
    if (i === 0) return null; // No gate before first section
    
    const gatePosition: [number, number, number] = [0, 0, -30 - (i * 5 - 1) * UPGRADE_SPACING - UPGRADE_SPACING / 2];
    const requiredUpgrades = 5;
    const sectionStart = (i - 1) * 5;
    const sectionEnd = sectionStart + 4;
    let completedUpgrades = 0;
    
    for (let j = sectionStart; j <= sectionEnd; j++) {
      if (purchasedUpgrades.has(j)) {
        completedUpgrades++;
      }
    }
    
    return {
      id: i,
      position: gatePosition,
      isUnlocked: unlockedGates.has(i),
      requiredUpgrades,
      completedUpgrades,
      sectionIndex: i
    };
  }).filter(Boolean);

  return {
    cameraPosition,
    selectedUpgrade,
    showInsufficientMana,
    maxUnlockedUpgrade,
    currentManaRef,
    upgrades,
    gates,
    unlockedGates,
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

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RepairKit } from './items/RepairKit';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useToast } from '@/hooks/use-toast';

interface RepairKitSpawnerProps {
  realm: 'fantasy' | 'scifi';
  playerPosition?: [number, number, number];
}

interface SpawnedRepairKit {
  id: string;
  position: [number, number, number];
  timestamp: number;
}

export const OptimizedRepairKitSpawner: React.FC<RepairKitSpawnerProps> = ({ 
  realm, 
  playerPosition = [0, 0, 0] 
}) => {
  const [repairKits, setRepairKits] = useState<SpawnedRepairKit[]>([]);
  const { addItem } = useInventoryStore();
  const { toast } = useToast();

  // Optimized spawning with longer intervals
  useEffect(() => {
    const spawnRepairKit = () => {
      const timestamp = Date.now();
      const id = `repair-${timestamp}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 8;
      const position: [number, number, number] = [
        playerPosition[0] + Math.cos(angle) * distance,
        0.5,
        playerPosition[2] + Math.sin(angle) * distance
      ];

      setRepairKits(prev => {
        // Remove old repair kits to prevent memory buildup
        const filtered = prev.filter(kit => timestamp - kit.timestamp < 60000);
        // Limit to max 3 repair kits
        if (filtered.length >= 3) return filtered;
        
        return [...filtered, { id, position, timestamp }];
      });
    };

    // Initial spawn with stagger
    setTimeout(() => spawnRepairKit(), 1000);
    setTimeout(() => spawnRepairKit(), 3000);

    // Spawn new ones less frequently
    const interval = setInterval(spawnRepairKit, 45000); // Increased from 30000
    return () => clearInterval(interval);
  }, [playerPosition]);

  const handlePickup = useCallback((kitId: string) => {
    const success = addItem({
      id: 'repair_kit',
      name: 'Repair Kit',
      icon: '🧰',
      rarity: 'common',
      maxStack: 99
    }, 1);

    if (success) {
      setRepairKits(prev => prev.filter(kit => kit.id !== kitId));
      toast({
        title: "Item Collected",
        description: "Repair Kit added to inventory",
        duration: 1500,
      });
    } else {
      toast({
        title: "Inventory Full",
        description: "No space for Repair Kit",
        variant: "destructive",
        duration: 1500,
      });
    }
  }, [addItem, toast]);

  // Optimized collision detection - only check every 10th frame equivalent
  const collisionCheckInterval = useRef(0);
  useEffect(() => {
    if (realm !== 'fantasy') return;
    
    const checkCollisions = () => {
      repairKits.forEach(kit => {
        const distance = Math.sqrt(
          Math.pow(playerPosition[0] - kit.position[0], 2) +
          Math.pow(playerPosition[2] - kit.position[2], 2)
        );
        
        if (distance < 1.5) {
          handlePickup(kit.id);
        }
      });
    };

    const interval = setInterval(checkCollisions, 100); // Check every 100ms instead of every frame
    return () => clearInterval(interval);
  }, [playerPosition, repairKits, realm, handlePickup]);

  // Memoize rendered repair kits
  const renderedKits = useMemo(() => 
    repairKits.map(kit => (
      <RepairKit
        key={kit.id}
        position={kit.position}
        realm={realm}
        onPickup={() => handlePickup(kit.id)}
      />
    )), [repairKits, realm, handlePickup]
  );

  return <group>{renderedKits}</group>;
};
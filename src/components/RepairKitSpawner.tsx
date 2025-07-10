import React, { useState, useEffect } from 'react';
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
}

export const RepairKitSpawner: React.FC<RepairKitSpawnerProps> = ({ 
  realm, 
  playerPosition = [0, 0, 0] 
}) => {
  const [repairKits, setRepairKits] = useState<SpawnedRepairKit[]>([]);
  const { addItem } = useInventoryStore();
  const { toast } = useToast();

  // Spawn repair kits randomly
  useEffect(() => {
    const spawnRepairKit = () => {
      const id = Date.now().toString();
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 10;
      const position: [number, number, number] = [
        playerPosition[0] + Math.cos(angle) * distance,
        0.5,
        playerPosition[2] + Math.sin(angle) * distance
      ];

      setRepairKits(prev => [...prev, { id, position }]);
    };

    // Spawn initial repair kits
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnRepairKit(), i * 2000);
    }

    // Spawn new ones periodically
    const interval = setInterval(spawnRepairKit, 30000);
    return () => clearInterval(interval);
  }, [playerPosition]);

  const handlePickup = (kitId: string) => {
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
        duration: 2000,
      });
    } else {
      toast({
        title: "Inventory Full",
        description: "No space for Repair Kit",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Check for collision in fantasy realm (walk over pickup)
  useEffect(() => {
    if (realm === 'fantasy') {
      repairKits.forEach(kit => {
        const distance = Math.sqrt(
          Math.pow(playerPosition[0] - kit.position[0], 2) +
          Math.pow(playerPosition[2] - kit.position[2], 2)
        );
        
        if (distance < 1.5) {
          handlePickup(kit.id);
        }
      });
    }
  }, [playerPosition, repairKits, realm]);

  return (
    <group>
      {repairKits.map(kit => (
        <RepairKit
          key={kit.id}
          position={kit.position}
          realm={realm}
          onPickup={() => handlePickup(kit.id)}
        />
      ))}
    </group>
  );
};
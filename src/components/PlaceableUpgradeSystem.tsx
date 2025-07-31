import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { nexusUpgradeModules, NexusUpgradeModule } from '@/data/NexusUpgradeModules';
import { useGameStateStore } from '@/stores/useGameStateStore';

interface PlacedUpgrade {
  id: string;
  moduleId: string;
  position: [number, number, number];
  module: NexusUpgradeModule;
}

interface UpgradeModuleProps {
  module: NexusUpgradeModule;
  position: [number, number, number];
  onClick?: () => void;
}

const UpgradeModule: React.FC<UpgradeModuleProps> = ({ module, position, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  const getSize = () => {
    switch (module.size) {
      case 'small': return [0.4, 0.4, 0.4];
      case 'medium': return [0.6, 0.6, 0.6];
      case 'large': return [0.8, 0.8, 0.8];
      default: return [0.4, 0.4, 0.4];
    }
  };

  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Main upgrade module */}
      <mesh 
        position={[0, 0.3, 0]}
        scale={getSize() as [number, number, number]}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={module.color} 
          emissive={hovered ? module.color : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {/* Floating icon */}
      <Html position={[0, 0.8, 0]} center>
        <div className="text-2xl pointer-events-none select-none">
          {module.icon}
        </div>
      </Html>
      
      {/* Tooltip when hovered */}
      {hovered && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none">
            <div className="font-semibold">{module.name}</div>
            <div className="text-xs text-gray-300">{module.bonus}</div>
          </div>
        </Html>
      )}
      
      {/* Glow effect */}
      <pointLight 
        position={[0, 0.5, 0]} 
        color={module.color} 
        intensity={0.5} 
        distance={2} 
      />
    </group>
  );
};

interface PathUpgradeSlotsProps {
  onSlotClick: (slotId: string, position: [number, number, number]) => void;
  placedUpgrades: PlacedUpgrade[];
}

const PathUpgradeSlots: React.FC<PathUpgradeSlotsProps> = ({ onSlotClick, placedUpgrades }) => {
  const slots = [];
  
  // Create slots along the path (left and right sides)
  for (let i = 0; i < 8; i++) {
    const z = (i - 3.5) * 2; // Position along the path
    
    // Left side slot
    slots.push({
      id: `left_${i}`,
      position: [-2.5, 0, z] as [number, number, number],
      side: 'left'
    });
    
    // Right side slot
    slots.push({
      id: `right_${i}`,
      position: [2.5, 0, z] as [number, number, number],
      side: 'right'
    });
  }

  return (
    <>
      {slots.map(slot => {
        const placedUpgrade = placedUpgrades.find(u => 
          Math.abs(u.position[0] - slot.position[0]) < 0.1 && 
          Math.abs(u.position[2] - slot.position[2]) < 0.1
        );
        
        if (placedUpgrade) {
          return (
            <UpgradeModule
              key={slot.id}
              module={placedUpgrade.module}
              position={slot.position}
            />
          );
        }
        
        return (
          <group key={slot.id} position={slot.position}>
            {/* Empty slot indicator */}
            <mesh 
              position={[0, 0.02, 0]}
              onClick={() => onSlotClick(slot.id, slot.position)}
            >
              <cylinderGeometry args={[0.4, 0.4, 0.05]} />
              <meshStandardMaterial 
                color="#333333" 
                transparent 
                opacity={0.5} 
              />
            </mesh>
            
            {/* Slot outline */}
            <mesh position={[0, 0.03, 0]}>
              <ringGeometry args={[0.4, 0.45]} />
              <meshBasicMaterial color="#666666" side={2} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

interface PlaceableUpgradeSystemProps {
  selectedModuleId?: string;
  onModulePlaced?: (moduleId: string, position: [number, number, number]) => void;
}

export const PlaceableUpgradeSystem: React.FC<PlaceableUpgradeSystemProps> = ({
  selectedModuleId,
  onModulePlaced
}) => {
  const gameState = useGameStateStore();
  const [placedUpgrades, setPlacedUpgrades] = useState<PlacedUpgrade[]>([]);

  const handleSlotClick = (slotId: string, position: [number, number, number]) => {
    if (!selectedModuleId) return;
    
    const module = nexusUpgradeModules.find(m => m.id === selectedModuleId);
    if (!module) return;
    
    // Check if player can afford the module
    if (gameState.nexusShards < module.cost) return;
    
    // Check if slot is already occupied
    const occupied = placedUpgrades.some(u => 
      Math.abs(u.position[0] - position[0]) < 0.1 && 
      Math.abs(u.position[2] - position[2]) < 0.1
    );
    if (occupied) return;
    
    // Place the upgrade
    const newUpgrade: PlacedUpgrade = {
      id: `upgrade_${Date.now()}`,
      moduleId: selectedModuleId,
      position,
      module
    };
    
    setPlacedUpgrades(prev => [...prev, newUpgrade]);
    gameState.spendNexusShards(module.cost);
    
    // Apply the module's effects
    if (module.realm === 'fantasy') {
      const bonus = parseInt(module.bonus.match(/\d+/)?.[0] || '0');
      gameState.setManaPerSecond(gameState.manaPerSecond + bonus);
    } else if (module.realm === 'scifi') {
      const bonus = parseInt(module.bonus.match(/\d+/)?.[0] || '0');
      gameState.setEnergyPerSecond(gameState.energyPerSecond + bonus);
    }
    
    onModulePlaced?.(selectedModuleId, position);
  };

  return (
    <PathUpgradeSlots 
      onSlotClick={handleSlotClick}
      placedUpgrades={placedUpgrades}
    />
  );
};
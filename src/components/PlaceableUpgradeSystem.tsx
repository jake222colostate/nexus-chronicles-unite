import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import { nexusUpgradeModules, NexusUpgradeModule } from '@/data/NexusUpgradeModules';
import { useGameStateStore } from '@/stores/useGameStateStore';
import { UpgradeSelectionMenu } from './UpgradeSelectionMenu';

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
  const meshRef = useRef<any>();
  
  // Simple approach: always render fallback since GLB files might not exist
  // This avoids the infinite re-render issue while maintaining functionality
  
  // Rotate the model slowly
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  // Render custom geometry based on module type
  const renderGeometry = () => {
    switch (module.id) {
      case 'large_obelisk':
        return (
          <group>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.15, 0.25, 0.8]} />
              <meshStandardMaterial color={module.color} />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <coneGeometry args={[0.2, 0.4]} />
              <meshStandardMaterial color={module.color} />
            </mesh>
          </group>
        );
      case 'lotus':
        return (
          <group>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.3, 0.3, Math.sin(angle) * 0.3]} rotation={[0, angle, Math.PI / 6]}>
                  <boxGeometry args={[0.1, 0.4, 0.05]} />
                  <meshStandardMaterial color={module.color} />
                </mesh>
              );
            })}
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial color={module.color} />
            </mesh>
          </group>
        );
      case 'phoenix':
        return (
          <group>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.2]} />
              <meshStandardMaterial color={module.color} emissive={module.color} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
              <coneGeometry args={[0.1, 0.3]} />
              <meshStandardMaterial color={module.color} />
            </mesh>
          </group>
        );
      case 'spiral':
        return (
          <group>
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 4;
              const height = i * 0.05;
              const radius = 0.2 + i * 0.02;
              return (
                <mesh key={i} position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}>
                  <sphereGeometry args={[0.05]} />
                  <meshStandardMaterial color={module.color} />
                </mesh>
              );
            })}
          </group>
        );
      case 'melting_tower':
        return (
          <group>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.6]} />
              <meshStandardMaterial color={module.color} />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <torusGeometry args={[0.25, 0.05]} />
              <meshStandardMaterial color={module.color} emissive={module.color} emissiveIntensity={0.2} />
            </mesh>
          </group>
        );
      case 'podiums':
        return (
          <group>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1]} />
              <meshStandardMaterial color={module.color} />
            </mesh>
            {[-0.2, 0, 0.2].map((offset, i) => (
              <mesh key={i} position={[offset, 0.3, 0]}>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial color={module.color} />
              </mesh>
            ))}
          </group>
        );
      default:
        return (
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={module.color} />
          </mesh>
        );
    }
  };

  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Custom geometry */}
      <group 
        ref={meshRef}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {renderGeometry()}
      </group>
      
      {/* Tooltip when hovered */}
      {hovered && (
        <Html position={[0, 1.5, 0]} center>
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
  onSlotClick: (slotId: string, position: [number, number, number], event?: any) => void;
  placedUpgrades: PlacedUpgrade[];
}

const PathUpgradeSlots: React.FC<PathUpgradeSlotsProps> = ({ onSlotClick, placedUpgrades }) => {
  const slots = [];
  
  // Create 4x8 grid on each side of the path
  const gridWidth = 4; // 4 slots wide on each side
  const gridLength = 8; // 8 slots long
  const slotSize = 1.5; // Size of each grid slot
  
  // Left side grid
  for (let x = 0; x < gridWidth; x++) {
    for (let z = 0; z < gridLength; z++) {
      const worldX = -2 - (x * slotSize) - (slotSize / 2); // Start left of path
      const worldZ = (z - gridLength / 2 + 0.5) * slotSize;
      
      slots.push({
        id: `left_${x}_${z}`,
        position: [worldX, 0, worldZ] as [number, number, number],
        side: 'left',
        gridX: x,
        gridZ: z
      });
    }
  }
  
  // Right side grid
  for (let x = 0; x < gridWidth; x++) {
    for (let z = 0; z < gridLength; z++) {
      const worldX = 2 + (x * slotSize) + (slotSize / 2); // Start right of path
      const worldZ = (z - gridLength / 2 + 0.5) * slotSize;
      
      slots.push({
        id: `right_${x}_${z}`,
        position: [worldX, 0, worldZ] as [number, number, number],
        side: 'right',
        gridX: x,
        gridZ: z
      });
    }
  }

  return (
    <>
      {/* Grid outline visualization */}
      {[-1, 1].map(side => (
        <group key={side}>
          {/* Grid background plane */}
          <mesh 
            position={[side * (2 + gridWidth * slotSize / 2 + slotSize / 2), 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[gridWidth * slotSize, gridLength * slotSize]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              transparent 
              opacity={0.3}
            />
          </mesh>
          
          {/* Grid lines */}
          {Array.from({ length: gridWidth + 1 }).map((_, i) => (
            <mesh
              key={`vertical_${i}`}
              position={[
                side * (2 + i * slotSize), 
                0.02, 
                0
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.05, gridLength * slotSize]} />
              <meshBasicMaterial color="#444444" />
            </mesh>
          ))}
          
          {Array.from({ length: gridLength + 1 }).map((_, i) => (
            <mesh
              key={`horizontal_${i}`}
              position={[
                side * (2 + gridWidth * slotSize / 2 + slotSize / 2), 
                0.02, 
                (i - gridLength / 2) * slotSize
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[gridWidth * slotSize, 0.05]} />
              <meshBasicMaterial color="#444444" />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Individual grid slots */}
      {slots.map(slot => {
        // Don't allow placement on the path (x between -2 and 2)
        if (Math.abs(slot.position[0]) < 2) return null;
        
        const placedUpgrade = placedUpgrades.find(u => 
          Math.abs(u.position[0] - slot.position[0]) < 0.5 && 
          Math.abs(u.position[2] - slot.position[2]) < 0.5
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
          <group key={slot.id}>
            {/* Clickable slot area */}
            <mesh 
              position={[slot.position[0], 0.02, slot.position[2]]}
              onClick={(event) => onSlotClick(slot.id, slot.position, event.nativeEvent)}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[slotSize * 0.9, slotSize * 0.9]} />
              <meshStandardMaterial 
                color="#333333" 
                transparent 
                opacity={0.1}
              />
            </mesh>
            
            {/* Slot border highlight on hover */}
            <mesh 
              position={[slot.position[0], 0.03, slot.position[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[slotSize * 0.4, slotSize * 0.45]} />
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
  onShowUpgradeMenu?: (show: boolean, position: { x: number; y: number }, slotData: { id: string; position: [number, number, number] } | null) => void;
}

export const PlaceableUpgradeSystem = React.forwardRef<
  { placeUpgrade: (moduleId: string, slotData: { id: string; position: [number, number, number] }) => void },
  PlaceableUpgradeSystemProps
>(({ selectedModuleId, onModulePlaced, onShowUpgradeMenu }, ref) => {
  const gameState = useGameStateStore();
  const [placedUpgrades, setPlacedUpgrades] = useState<PlacedUpgrade[]>([]);

  const handleSlotClick = (slotId: string, position: [number, number, number], event?: any) => {
    // Prevent placement on the path (x between -2 and 2)
    if (Math.abs(position[0]) < 2) return;
    
    // Check if slot is already occupied
    const occupied = placedUpgrades.some(u => 
      Math.abs(u.position[0] - position[0]) < 0.5 && 
      Math.abs(u.position[2] - position[2]) < 0.5
    );
    if (occupied) return;
    
    // Set menu position and show upgrade selection
    let menuPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (event && event.clientX && event.clientY) {
      menuPos = { x: event.clientX, y: event.clientY };
    }
    
    onShowUpgradeMenu?.(true, menuPos, { id: slotId, position });
  };

  // Expose method to place upgrade from external menu
  const placeUpgrade = (moduleId: string, slotData: { id: string; position: [number, number, number] }) => {
    const module = nexusUpgradeModules.find(m => m.id === moduleId);
    if (!module) return;
    
    // Place the upgrade (free for now)
    const newUpgrade: PlacedUpgrade = {
      id: `upgrade_${Date.now()}`,
      moduleId,
      position: slotData.position,
      module
    };
    
    setPlacedUpgrades(prev => [...prev, newUpgrade]);
    
    // Apply the module's effects
    if (module.realm === 'fantasy') {
      const bonus = parseInt(module.bonus.match(/\d+/)?.[0] || '0');
      gameState.setManaPerSecond(gameState.manaPerSecond + bonus);
    } else if (module.realm === 'scifi') {
      const bonus = parseInt(module.bonus.match(/\d+/)?.[0] || '0');
      gameState.setEnergyPerSecond(gameState.energyPerSecond + bonus);
    }
    
    onModulePlaced?.(moduleId, slotData.position);
  };

  // Store reference for external access
  React.useImperativeHandle(ref, () => ({
    placeUpgrade
  }));

  return (
    <PathUpgradeSlots 
      onSlotClick={handleSlotClick}
      placedUpgrades={placedUpgrades}
    />
  );
});
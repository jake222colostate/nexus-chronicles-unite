import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { NexusModule } from '@/data/NexusModules';

interface PlacedModule {
  id: string;
  moduleId: string;
  position: [number, number, number];
  module: NexusModule;
}

interface NexusModulePlacementProps {
  placedModules: PlacedModule[];
  onModuleClick: (moduleId: string) => void;
  gridSize?: number;
  maxDistance?: number;
}

export const NexusModulePlacement: React.FC<NexusModulePlacementProps> = ({
  placedModules,
  onModuleClick,
  gridSize = 16,
  maxDistance = 8
}) => {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  return (
    <group>
      {/* Placement Grid - Circular Pattern */}
      <NexusPlacementGrid 
        size={gridSize} 
        maxDistance={maxDistance}
        placedModules={placedModules}
      />
      
      {/* Placed Modules */}
      {placedModules.map((placedModule) => (
        <NexusModuleRenderer
          key={placedModule.id}
          placedModule={placedModule}
          isHovered={hoveredModule === placedModule.id}
          onHover={setHoveredModule}
          onClick={onModuleClick}
        />
      ))}
    </group>
  );
};

// Circular placement grid component
const NexusPlacementGrid: React.FC<{
  size: number;
  maxDistance: number;
  placedModules: PlacedModule[];
}> = ({ size, maxDistance, placedModules }) => {
  const gridPositions: Array<[number, number]> = [];
  
  // Generate circular grid positions
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / size) {
    for (let radius = 2; radius <= maxDistance; radius += 2) {
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      gridPositions.push([Math.round(x), Math.round(z)]);
    }
  }

  // Filter out occupied positions
  const occupiedPositions = new Set(
    placedModules.map(m => `${Math.round(m.position[0])},${Math.round(m.position[2])}`)
  );

  const availablePositions = gridPositions.filter(
    ([x, z]) => !occupiedPositions.has(`${x},${z}`)
  );

  return (
    <group>
      {availablePositions.map(([x, z], index) => (
        <mesh
          key={`grid-${x}-${z}`}
          position={[x, 0.05, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.8, 1.0, 8]} />
          <meshBasicMaterial 
            color="#4a5568" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Individual module renderer component
const NexusModuleRenderer: React.FC<{
  placedModule: PlacedModule;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (moduleId: string) => void;
}> = ({ placedModule, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { module, position } = placedModule;
  
  // Get size multiplier based on module size
  const sizeMultiplier = module.size === 'small' ? 0.8 : module.size === 'medium' ? 1.2 : 1.8;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.01;
      
      // Floating animation
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Hover effect
      if (isHovered) {
        meshRef.current.scale.setScalar(sizeMultiplier * 1.1);
      } else {
        meshRef.current.scale.setScalar(sizeMultiplier);
      }
    }
  });

  return (
    <group position={position}>
      {/* Crystal Base/Pedestal */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.4, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Main Crystal */}
      <mesh
        ref={meshRef}
        position={[0, 0.5, 0]}
        onPointerEnter={() => onHover(placedModule.id)}
        onPointerLeave={() => onHover(null)}
        onClick={() => onClick(placedModule.moduleId)}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={module.visualTheme.crystalColor}
          emissive={module.visualTheme.glowColor}
          emissiveIntensity={isHovered ? 0.6 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow Effect */}
      <pointLight
        position={[0, 1, 0]}
        color={module.visualTheme.glowColor}
        intensity={isHovered ? 2 : 1}
        distance={5}
        decay={2}
      />
      
      {/* Particle Effect Ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 1.5,
              0.3 + Math.sin(Date.now() * 0.001 + i) * 0.1,
              Math.sin(angle) * 1.5
            ]}
          >
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial 
              color={module.visualTheme.particleColor}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
      
      {/* Tooltip on Hover */}
      {isHovered && (
        <Html position={[0, 3, 0]} center>
          <div className="bg-black/90 text-white p-2 rounded-lg border border-purple-400/30 pointer-events-none">
            <div className="font-bold text-sm">{module.name}</div>
            <div className="text-xs text-gray-300 max-w-40 text-center">
              {module.description}
            </div>
            <div className="text-xs text-purple-400 mt-1">
              {module.realm} • {module.size}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
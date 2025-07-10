import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface GridTile {
  x: number;
  z: number;
  occupied: boolean;
  upgrade?: any;
}

interface NexusSandboxGridProps {
  position: [number, number, number];
  size: number;
  onTileClick: (x: number, z: number) => void;
}

export const NexusSandboxGrid: React.FC<NexusSandboxGridProps> = ({
  position,
  size,
  onTileClick
}) => {
  const [hoveredTile, setHoveredTile] = useState<{x: number, z: number} | null>(null);
  const gridRef = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (gridRef.current && gridRef.current.material) {
      const material = gridRef.current.material as any;
      material.emissiveIntensity = 0.1 + Math.sin(time * 2) * 0.05;
    }
  });

  const tiles: GridTile[] = [];
  const tileSize = 1;
  const halfSize = Math.floor(size / 2);

  // Generate grid tiles
  for (let x = -halfSize; x <= halfSize; x++) {
    for (let z = -halfSize; z <= halfSize; z++) {
      tiles.push({
        x,
        z,
        occupied: false,
        upgrade: null
      });
    }
  }

  return (
    <group position={position}>
      {/* Grid Base Platform */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[size + 1, 0.2, size + 1]} />
        <meshStandardMaterial 
          color="#1a1a3e"
          metalness={0.6}
          roughness={0.4}
          emissive="#0a0a2e"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Grid Lines */}
      <mesh ref={gridRef} position={[0, 0.01, 0]}>
        <planeGeometry args={[size, size, size, size]} />
        <meshStandardMaterial 
          color="#3b82f6"
          transparent
          opacity={0.4}
          wireframe
          emissive="#1d4ed8"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Interactive Grid Tiles */}
      {tiles.map((tile) => {
        const isHovered = hoveredTile?.x === tile.x && hoveredTile?.z === tile.z;
        
        return (
          <mesh
            key={`${tile.x}-${tile.z}`}
            position={[tile.x * tileSize, 0.02, tile.z * tileSize]}
            onPointerEnter={() => setHoveredTile({x: tile.x, z: tile.z})}
            onPointerLeave={() => setHoveredTile(null)}
            onClick={() => onTileClick(tile.x, tile.z)}
          >
            <planeGeometry args={[tileSize * 0.9, tileSize * 0.9]} />
            <meshStandardMaterial 
              color={isHovered ? "#60a5fa" : "#1e40af"}
              transparent
              opacity={isHovered ? 0.8 : 0.3}
              emissive={isHovered ? "#3b82f6" : "#1d4ed8"}
              emissiveIntensity={isHovered ? 0.5 : 0.1}
            />
          </mesh>
        );
      })}

      {/* Grid Border Crystals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = (size / 2) + 1;
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              0.3,
              Math.sin(angle) * radius
            ]}
          >
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial 
              color="#8b5cf6"
              emissive="#7c3aed"
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}

      {/* Corner Pedestals */}
      {[
        [-halfSize - 0.5, -halfSize - 0.5],
        [halfSize + 0.5, -halfSize - 0.5],
        [-halfSize - 0.5, halfSize + 0.5],
        [halfSize + 0.5, halfSize + 0.5]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.3, 0.4, 0.4, 8]} />
          <meshStandardMaterial 
            color="#2a2a4e"
            metalness={0.8}
            roughness={0.2}
            emissive="#1a1a3e"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};
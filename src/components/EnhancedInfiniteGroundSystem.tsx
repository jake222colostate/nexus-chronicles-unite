
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import * as THREE from 'three';

interface EnhancedInfiniteGroundSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

export const EnhancedInfiniteGroundSystem: React.FC<EnhancedInfiniteGroundSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  if (realm !== 'fantasy') {
    return null;
  }

  const infiniteGroundTiles = useMemo(() => {
    const tiles = [];
    const tileSize = chunkSize;
    
    // More stable ground coverage that doesn't flicker
    const playerZ = Math.abs(playerPosition.z);
    const startZ = Math.floor((playerZ - 300) / tileSize) * tileSize;
    const endZ = Math.floor((playerZ + 500) / tileSize) * tileSize;
    
    // Generate stable ground tiles
    for (let z = startZ; z <= endZ; z += tileSize) {
      // Main center ground tile
      tiles.push({
        key: `infinite_ground_main_${z}`,
        position: [0, -1.8, -z] as [number, number, number],
        size: tileSize + 20, // Increased overlap for seamless coverage
        type: 'main'
      });
      
      // Side extensions for full coverage
      [-1, 1].forEach(side => {
        tiles.push({
          key: `infinite_ground_side_${side}_${z}`,
          position: [side * (tileSize + 10), -1.8, -z] as [number, number, number],
          size: tileSize + 10,
          type: 'side'
        });
      });
    }
    
    return tiles;
  }, [
    // Less frequent updates to prevent flickering
    Math.floor(playerPosition.z / 50) * 50,
    chunkSize
  ]);

  return (
    <group name="EnhancedInfiniteGroundSystem">
      {infiniteGroundTiles.map((tile) => (
        <mesh
          key={tile.key}
          position={tile.position}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
          matrixAutoUpdate={false}
        >
          <planeGeometry args={[tile.size, tile.size, 1, 1]} />
          <meshStandardMaterial
            color={tile.type === 'main' ? "#2d4a2d" : "#1a3a1b"}
            roughness={0.9}
            metalness={0.1}
            side={THREE.DoubleSide}
            transparent={false}
            opacity={1.0}
          />
        </mesh>
      ))}
      
      {/* Persistent base ground layer that never disappears */}
      <mesh 
        key="persistent_base_ground"
        position={[0, -2.5, playerPosition.z]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        frustumCulled={false}
        matrixAutoUpdate={false}
      >
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial 
          color="#1a2a1b"
          roughness={1.0}
          metalness={0.0}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1.0}
        />
      </mesh>
    </group>
  );
};

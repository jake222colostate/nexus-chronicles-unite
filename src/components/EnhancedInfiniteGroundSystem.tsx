
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
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const infiniteGroundTiles = useMemo(() => {
    const tiles = [];
    const tileSize = chunkSize;
    
    // PERFORMANCE FIX: Much less aggressive ground coverage
    const playerZ = playerPosition.z;
    const startZ = Math.floor((playerZ - 150) / tileSize) * tileSize; // Reduced from 500
    const endZ = Math.floor((playerZ + 200) / tileSize) * tileSize; // Reduced from 800
    
    // PERFORMANCE FIX: Single ground layer only
    for (let z = startZ; z <= endZ; z += tileSize) {
      // Main ground plane - no overlap
      tiles.push({
        key: `infinite_ground_main_${z}`,
        position: [0, -1.8, z] as [number, number, number],
        size: tileSize,
        type: 'main'
      });
    }
    
    console.log(`EnhancedInfiniteGroundSystem: Generated ${tiles.length} optimized ground tiles`);
    return tiles;
  }, [
    Math.floor(playerPosition.z / 25) * 25, // Reduced frequency
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
          frustumCulled={true} // Re-enabled frustum culling for performance
        >
          <planeGeometry args={[tile.size, tile.size]} />
          <meshStandardMaterial
            color="#2d4a2d"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Single base layer only */}
      <mesh 
        position={[0, -2.5, playerPosition.z]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        frustumCulled={true}
      >
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial 
          color="#1a2a1b"
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
};

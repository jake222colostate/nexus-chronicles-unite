
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
    
    // Reduced ground coverage for 60fps
    const playerZ = playerPosition.z;
    const startZ = Math.floor((playerZ - 200) / tileSize) * tileSize;
    const endZ = Math.floor((playerZ + 400) / tileSize) * tileSize;
    
    // Reduced layers for 60fps
    for (let z = startZ; z <= endZ; z += tileSize) {
      // Only 2 layers instead of 3
      for (let layer = 0; layer < 2; layer++) {
        const layerY = -1.8 - (layer * 0.1);
        
        tiles.push({
          key: `infinite_ground_main_${z}_layer_${layer}`,
          position: [0, layerY, z] as [number, number, number],
          size: tileSize + 10, // Reduced overlap
          type: 'main',
          layer
        });
        
        // Reduced side extensions
        [-1, 1].forEach(side => {
          tiles.push({
            key: `infinite_ground_side_${side}_${z}_layer_${layer}`,
            position: [side * (tileSize + 5), layerY, z] as [number, number, number],
            size: tileSize + 5,
            type: 'side',
            layer
          });
        });
      }
    }
    
    return tiles;
  }, [
    Math.floor(playerPosition.z / 20) * 20,
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
          renderOrder={-tile.layer}
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
      
      {/* Reduced base layers for 60fps */}
      {Array.from({ length: 2 }, (_, i) => (
        <mesh 
          key={`mega_base_${i}`}
          position={[0, -2.5 - (i * 0.2), playerPosition.z]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          receiveShadow
          frustumCulled={false}
          matrixAutoUpdate={false}
          renderOrder={-10 - i}
        >
          <planeGeometry args={[1000 + (i * 100), 1000 + (i * 100)]} />
          <meshStandardMaterial 
            color={i === 0 ? "#1a2a1b" : "#0f1f0c"}
            roughness={1.0}
            metalness={0.0}
            side={THREE.DoubleSide}
            transparent={false}
            opacity={1.0}
          />
        </mesh>
      ))}
    </group>
  );
};

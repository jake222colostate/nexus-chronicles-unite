
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
    
    // FIXED: Much more aggressive ground coverage to prevent any gaps
    const playerZ = playerPosition.z;
    const startZ = Math.floor((playerZ - 500) / tileSize) * tileSize; // Increased coverage
    const endZ = Math.floor((playerZ + 800) / tileSize) * tileSize; // Increased coverage
    
    // Generate seamless ground tiles with massive overlap
    for (let z = startZ; z <= endZ; z += tileSize) {
      // MULTIPLE ground layers for guaranteed coverage
      for (let layer = 0; layer < 3; layer++) {
        const layerY = -1.8 - (layer * 0.1); // Stacked layers
        
        // Main ground plane with massive overlap
        tiles.push({
          key: `infinite_ground_main_${z}_layer_${layer}`,
          position: [0, layerY, z] as [number, number, number],
          size: tileSize + 20, // Massive overlap
          type: 'main',
          layer
        });
        
        // Side ground extensions with overlap
        [-2, -1, 1, 2].forEach(side => {
          tiles.push({
            key: `infinite_ground_side_${side}_${z}_layer_${layer}`,
            position: [side * (tileSize + 5), layerY, z] as [number, number, number],
            size: tileSize + 10,
            type: 'side',
            layer
          });
        });
      }
    }
    
    console.log(`EnhancedInfiniteGroundSystem: Generated ${tiles.length} layered ground tiles for seamless coverage`);
    return tiles;
  }, [
    // FIXED: Reduced recalculation frequency for stability
    Math.floor(playerPosition.z / 10) * 10, // Reduced frequency
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
          frustumCulled={false} // CRITICAL: Never cull
          matrixAutoUpdate={true}
          renderOrder={-tile.layer} // Ensure proper layering
        >
          <planeGeometry args={[tile.size, tile.size, 1, 1]} />
          <meshStandardMaterial 
            color={tile.type === 'main' ? "#2d4a2b" : "#1a3a1b"}
            roughness={0.9}
            metalness={0.1}
            side={THREE.DoubleSide} // CRITICAL: Visible from any angle
            transparent={false}
            opacity={1.0}
            depthTest={true}
            depthWrite={tile.layer === 0} // Only write depth for top layer
            depthFunc={THREE.LessEqualDepth}
          />
        </mesh>
      ))}
      
      {/* ENHANCED: Multiple massive base layers for absolute ground guarantee */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh 
          key={`mega_base_${i}`}
          position={[0, -2.5 - (i * 0.2), playerPosition.z]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          receiveShadow
          frustumCulled={false} // CRITICAL: Never cull
          matrixAutoUpdate={true}
          renderOrder={-10 - i}
        >
          <planeGeometry args={[2000 + (i * 200), 2000 + (i * 200)]} />
          <meshStandardMaterial 
            color={i === 0 ? "#1a2a1b" : "#0f1f0c"}
            roughness={1.0}
            metalness={0.0}
            side={THREE.DoubleSide}
            transparent={false}
            opacity={1.0}
            depthTest={true}
            depthWrite={i === 0}
          />
        </mesh>
      ))}
    </group>
  );
};

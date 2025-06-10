
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
    const bufferZones = 5; // Extra tiles beyond render distance
    
    // Calculate extended range to prevent terrain gaps
    const playerZ = Math.abs(playerPosition.z);
    const startZ = Math.floor((playerZ - 200) / tileSize) * tileSize; // Look far back
    const endZ = Math.floor((playerZ + 300) / tileSize) * tileSize; // Look far forward
    
    // Generate seamless ground tiles that never disappear
    for (let z = startZ; z <= endZ; z += tileSize) {
      // Main ground plane - wider than chunk system
      tiles.push({
        key: `infinite_ground_main_${z}`,
        position: [0, -2.5, -z] as [number, number, number], // Slightly lower than mountains
        size: tileSize + 10, // Overlap tiles to prevent gaps
        type: 'main'
      });
      
      // Side ground extensions to ensure full coverage
      [-1, 1].forEach(side => {
        tiles.push({
          key: `infinite_ground_side_${side}_${z}`,
          position: [side * (tileSize + 5), -2.5, -z] as [number, number, number],
          size: tileSize,
          type: 'side'
        });
      });
    }
    
    console.log(`EnhancedInfiniteGroundSystem: Generated ${tiles.length} infinite ground tiles from Z=${startZ} to Z=${endZ}`);
    return tiles;
  }, [
    // Reduce recalculation frequency by rounding player position
    Math.floor(Math.abs(playerPosition.z) / 20) * 20,
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
          frustumCulled={false} // CRITICAL: Prevent ground from disappearing
          matrixAutoUpdate={true}
        >
          <planeGeometry args={[tile.size, tile.size, 1, 1]} />
          <meshStandardMaterial 
            color={tile.type === 'main' ? "#2d4a2b" : "#1a3a1b"}
            roughness={0.9}
            metalness={0.1}
            side={THREE.DoubleSide} // Ensure visibility from any angle
            transparent={false}
            opacity={1.0}
            depthTest={true}
            depthWrite={true}
          />
        </mesh>
      ))}
      
      {/* Additional base layer to guarantee ground presence */}
      <mesh 
        position={[0, -3, -Math.abs(playerPosition.z)]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        frustumCulled={false}
      >
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial 
          color="#1a2a1b"
          roughness={1.0}
          metalness={0.0}
          side={THREE.DoubleSide}
          transparent={false}
        />
      </mesh>
    </group>
  );
};

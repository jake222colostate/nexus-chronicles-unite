
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
    
    // FIXED: Use consistent Z positioning logic
    const playerZ = playerPosition.z; // Use actual Z, not absolute
    const startZ = Math.floor((playerZ - 300) / tileSize) * tileSize; // Look far back
    const endZ = Math.floor((playerZ + 500) / tileSize) * tileSize; // Look far forward
    
    // Generate seamless ground tiles that never disappear
    for (let z = startZ; z <= endZ; z += tileSize) {
      // Main ground plane - consistent with mountain positioning
      tiles.push({
        key: `infinite_ground_main_${z}`,
        position: [0, -1.8, z] as [number, number, number], // Fixed Y positioning at -1.8
        size: tileSize + 10, // Overlap tiles to prevent gaps
        type: 'main'
      });
      
      // Side ground extensions to ensure full coverage
      [-1, 1].forEach(side => {
        tiles.push({
          key: `infinite_ground_side_${side}_${z}`,
          position: [side * (tileSize + 5), -1.8, z] as [number, number, number],
          size: tileSize,
          type: 'side'
        });
      });
    }
    
    console.log(`EnhancedInfiniteGroundSystem: Generated ${tiles.length} infinite ground tiles from Z=${startZ} to Z=${endZ} at Y=-1.8`);
    return tiles;
  }, [
    // Reduce recalculation frequency by rounding player position
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
      
      {/* Additional base layer to guarantee ground presence - FIXED positioning */}
      <mesh 
        position={[0, -2.2, playerPosition.z]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        frustumCulled={false}
      >
        <planeGeometry args={[1000, 1000]} />
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

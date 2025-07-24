import React, { useMemo, useRef } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface SeamlessGroundSystemProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
  fogDistance: number;
}

interface GroundTile {
  key: string;
  position: [number, number, number];
  size: number;
  opacity: number;
  distanceToPlayer: number;
  chunkId: string;
}

export const SeamlessGroundSystem: React.FC<SeamlessGroundSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition,
  fogDistance
}) => {
  const meshRefs = useRef<{ [key: string]: any }>({});

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const groundTiles = useMemo(() => {
    const tiles: GroundTile[] = [];
    
    // Create seamless ground tiles based on fog-aware chunks
    chunks.forEach((chunk) => {
      const { worldX, worldZ, fogOpacity, id, distanceToPlayer } = chunk;
      
      tiles.push({
        key: `ground_${id}`,
        position: [worldX, -1.8, worldZ], // Consistent ground level
        size: chunkSize,
        opacity: fogOpacity,
        distanceToPlayer,
        chunkId: id
      });
      
      // Add overlap tiles at chunk boundaries for seamless transitions
      if (fogOpacity > 0.5) {
        // Overlap tiles to prevent gaps during transitions
        const overlapSize = chunkSize * 0.1;
        
        tiles.push({
          key: `ground_overlap_x_${id}`,
          position: [worldX + chunkSize * 0.5, -1.8, worldZ], // Same level as main tiles
          size: overlapSize,
          opacity: fogOpacity * 0.8,
          distanceToPlayer,
          chunkId: `${id}_overlap_x`
        });
        
        tiles.push({
          key: `ground_overlap_z_${id}`,
          position: [worldX, -1.8, worldZ + chunkSize * 0.5], // Same level as main tiles
          size: overlapSize,
          opacity: fogOpacity * 0.8,
          distanceToPlayer,
          chunkId: `${id}_overlap_z`
        });
      }
    });
    
    // Sort by distance for proper rendering order
    tiles.sort((a, b) => b.distanceToPlayer - a.distanceToPlayer);
    
    console.log(`SeamlessGroundSystem: Generated ${tiles.length} seamless ground tiles`);
    return tiles;
  }, [chunks, chunkSize]);

  // Animate opacity transitions for smooth loading/unloading
  useFrame(() => {
    groundTiles.forEach((tile) => {
      const mesh = meshRefs.current[tile.key];
      if (mesh && mesh.material) {
        // Smooth opacity transition
        const targetOpacity = tile.opacity;
        const currentOpacity = mesh.material.opacity;
        const delta = targetOpacity - currentOpacity;
        
        if (Math.abs(delta) > 0.01) {
          mesh.material.opacity = currentOpacity + delta * 0.1; // Smooth interpolation
        }
      }
    });
  });

  return (
    <group name="SeamlessGroundSystem">
      {groundTiles.map((tile) => (
        <mesh
          key={tile.key}
          ref={(ref) => {
            if (ref) meshRefs.current[tile.key] = ref;
          }}
          position={tile.position}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false} // Disable for seamless transitions
        >
          <planeGeometry args={[tile.size, tile.size, 2, 2]} />
          <meshStandardMaterial
            color="#2d4a2d"
            roughness={0.9}
            metalness={0.1}
            transparent
            opacity={tile.opacity}
            alphaTest={0.1}
            fog={true} // Enable fog interaction
          />
        </mesh>
      ))}
      
      {/* Base foundation layer with fog-aware opacity */}
      <mesh 
        position={[0, -2.5, playerPosition.z]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        frustumCulled={false}
      >
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial 
          color="#1a2a1b"
          roughness={1.0}
          metalness={0.0}
          transparent
          opacity={0.8}
          fog={true}
        />
      </mesh>
      
      {/* Far background layer for depth */}
      <mesh 
        position={[0, -3.0, playerPosition.z - fogDistance * 0.5]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        frustumCulled={false}
      >
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial 
          color="#0f1a10"
          roughness={1.0}
          metalness={0.0}
          transparent
          opacity={0.4}
          fog={true}
        />
      </mesh>
    </group>
  );
};
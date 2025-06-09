
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface InfiniteGroundSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const InfiniteGroundSystem: React.FC<InfiniteGroundSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const groundChunks = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Create ground plane exactly aligned with chunk boundaries
      instances.push({
        key: `ground_${chunk.id}`,
        position: [0, -1.5, worldZ] as [number, number, number], // Centered at X=0, straight line along Z
        size: chunkSize
      });
    });
    
    console.log(`InfiniteGroundSystem: Generated ${instances.length} ground chunks in straight line`);
    return instances;
  }, [chunks, chunkSize]);

  return (
    <group name="StraightLineGroundSystem">
      {groundChunks.map((ground) => (
        <mesh 
          key={ground.key}
          position={ground.position} 
          rotation={[-Math.PI / 2, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[ground.size, ground.size]} />
          <meshStandardMaterial 
            color="#2d4a2b" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

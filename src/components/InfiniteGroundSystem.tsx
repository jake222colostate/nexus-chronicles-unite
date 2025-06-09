
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
      instances.push({
        key: `ground_${chunk.id}`,
        position: [chunk.worldX, -1.5, chunk.worldZ] as [number, number, number],
        size: chunkSize
      });
    });
    
    console.log(`InfiniteGroundSystem: Generated ${instances.length} ground chunks for infinite terrain`);
    return instances;
  }, [chunks, chunkSize]);

  return (
    <group name="InfiniteGroundSystem">
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

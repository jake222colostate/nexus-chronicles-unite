
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';

interface CleanPathSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const CleanPathSystem: React.FC<CleanPathSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const pathElements = useMemo(() => {
    const elements = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const segmentCount = Math.ceil(chunkSize / 4);
      
      for (let i = 0; i < segmentCount; i++) {
        const z = worldZ - (i * 4);
        const segmentSeed = seed + i * 127;
        
        elements.push({
          type: 'path',
          x: 0,
          y: -0.1,
          z: z,
          seed: segmentSeed,
          chunkId: chunk.id,
          index: i
        });
      }
    });
    
    return elements;
  }, [chunks, chunkSize]);

  return (
    <group>
      {/* Main path base - always clear */}
      {pathElements.map((element) => (
        <group key={`clean_path_${element.chunkId}_${element.index}`}>
          {/* Smooth stone path */}
          <mesh 
            position={[element.x, element.y, element.z]} 
            receiveShadow
          >
            <boxGeometry args={[6, 0.05, 4]} />
            <meshLambertMaterial color="#8B7355" />
          </mesh>
          
          {/* Path border stones */}
          <mesh 
            position={[element.x - 3.2, element.y + 0.02, element.z]} 
            receiveShadow
          >
            <boxGeometry args={[0.4, 0.1, 4]} />
            <meshLambertMaterial color="#696969" />
          </mesh>
          
          <mesh 
            position={[element.x + 3.2, element.y + 0.02, element.z]} 
            receiveShadow
          >
            <boxGeometry args={[0.4, 0.1, 4]} />
            <meshLambertMaterial color="#696969" />
          </mesh>
          
          {/* Side grass areas (no obstructions) */}
          <mesh 
            position={[element.x - 6, element.y - 0.01, element.z]} 
            receiveShadow
          >
            <boxGeometry args={[6, 0.02, 4]} />
            <meshLambertMaterial color="#2E7D32" />
          </mesh>
          
          <mesh 
            position={[element.x + 6, element.y - 0.01, element.z]} 
            receiveShadow
          >
            <boxGeometry args={[6, 0.02, 4]} />
            <meshLambertMaterial color="#2E7D32" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

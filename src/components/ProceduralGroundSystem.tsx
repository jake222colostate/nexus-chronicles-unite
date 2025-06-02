
import React from 'react';
import { ChunkData } from './ChunkSystem';

interface ProceduralGroundSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const ProceduralGroundSystem: React.FC<ProceduralGroundSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {chunks.map(chunk => (
        <mesh 
          key={chunk.id}
          position={[chunk.worldX, -1.5, chunk.worldZ]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[chunkSize, chunkSize]} />
          <meshLambertMaterial color="#2d4a2b" />
        </mesh>
      ))}
    </group>
  );
};

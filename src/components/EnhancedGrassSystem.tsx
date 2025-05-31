
import React from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface EnhancedGrassSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

export const EnhancedGrassSystem: React.FC<EnhancedGrassSystemProps> = ({
  chunks,
  chunkSize
}) => {
  return (
    <group>
      {chunks.map(chunk => (
        <group key={`grass_${chunk.id}`}>
          {/* Green grass ground plane - wider areas like in the image */}
          <mesh 
            position={[chunk.worldX, -0.5, chunk.worldZ]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[chunkSize * 1.5, chunkSize]} />
            <meshLambertMaterial color="#22c55e" />
          </mesh>
          
          {/* Brown path in the center */}
          <mesh 
            position={[chunk.worldX, -0.4, chunk.worldZ]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[8, chunkSize]} />
            <meshLambertMaterial color="#92400e" />
          </mesh>
          
          {/* Stone path details - like the platforms in the image */}
          {Array.from({ length: 3 }, (_, i) => (
            <mesh 
              key={i}
              position={[chunk.worldX, -0.3, chunk.worldZ - (i * 15)]} 
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[6, 8]} />
              <meshLambertMaterial color="#a8a29e" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

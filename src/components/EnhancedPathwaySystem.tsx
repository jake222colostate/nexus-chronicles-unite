
import React from 'react';
import { ChunkData } from './ChunkSystem';

interface EnhancedPathwaySystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

export const EnhancedPathwaySystem: React.FC<EnhancedPathwaySystemProps> = ({
  chunks,
  chunkSize
}) => {
  return (
    <group>
      {/* Main path base - darker ground for contrast */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, -100]} receiveShadow>
        <planeGeometry args={[8, 400]} />
        <meshStandardMaterial 
          color="#1B5E20"
          roughness={0.9}
        />
      </mesh>
      
      {/* Path border grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, -1.09, -100]} receiveShadow>
        <planeGeometry args={[6, 400]} />
        <meshStandardMaterial 
          color="#388E3C"
          roughness={0.8}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, -1.09, -100]} receiveShadow>
        <planeGeometry args={[6, 400]} />
        <meshStandardMaterial 
          color="#388E3C"
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};

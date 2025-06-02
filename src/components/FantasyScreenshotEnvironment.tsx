
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { RealisticMountainSystem } from './RealisticMountainSystem';
import { RealisticTreeSystem } from './RealisticTreeSystem';
import { RealisticPathSystem } from './RealisticPathSystem';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = ({
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
      {/* Ground plane */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshLambertMaterial color="#2d4a2b" />
      </mesh>
      
      {/* Realistic mountains with varied shapes */}
      <RealisticMountainSystem 
        chunks={chunks} 
        chunkSize={chunkSize} 
        realm={realm} 
      />
      
      {/* Realistic trees with different types */}
      <RealisticTreeSystem 
        chunks={chunks} 
        chunkSize={chunkSize} 
        realm={realm} 
      />
      
      {/* Detailed cobblestone path */}
      <RealisticPathSystem 
        chunks={chunks} 
        chunkSize={chunkSize} 
        realm={realm} 
      />
    </group>
  );
};

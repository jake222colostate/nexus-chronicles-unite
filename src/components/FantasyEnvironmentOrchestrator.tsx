
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { RealisticMountainSystem } from './RealisticMountainSystem';
import { RealisticTreeSystem } from './RealisticTreeSystem';
import { RealisticPathSystem } from './RealisticPathSystem';
import { FantasyGroundPlane } from './FantasyGroundPlane';

interface FantasyEnvironmentOrchestratorProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyEnvironmentOrchestrator: React.FC<FantasyEnvironmentOrchestratorProps> = ({
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
      <FantasyGroundPlane realm={realm} />
      
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

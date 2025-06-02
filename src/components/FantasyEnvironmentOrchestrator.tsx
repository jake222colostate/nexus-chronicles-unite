
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { ProceduralMountainTerrain } from './ProceduralMountainTerrain';
import { ProceduralGroundSystem } from './ProceduralGroundSystem';
import { RealisticTreeSystem } from './RealisticTreeSystem';
import { RealisticPathSystem } from './RealisticPathSystem';

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
      {/* Procedural ground with realistic textures */}
      <ProceduralGroundSystem 
        chunks={chunks} 
        chunkSize={chunkSize} 
        realm={realm} 
      />
      
      {/* Realistic mountain terrain that extends infinitely */}
      <ProceduralMountainTerrain 
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


import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyInfiniteTileSystem } from './FantasyInfiniteTileSystem';
import { FantasyDuskSkybox } from './FantasyDuskSkybox';
import { FantasyDuskLighting } from './FantasyDuskLighting';
import { FantasyPostProcessing } from './FantasyPostProcessing';
import { Vector3 } from 'three';

interface FantasyEnvironmentOrchestratorProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: Vector3;
}

export const FantasyEnvironmentOrchestrator: React.FC<FantasyEnvironmentOrchestratorProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new Vector3(0, 0, 0)
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {/* Infinite tiling system with GLB models */}
      <FantasyInfiniteTileSystem
        playerPosition={playerPosition}
        renderDistance={120}
      />
      
      {/* Fantasy dusk skybox */}
      <FantasyDuskSkybox />
      
      {/* Specialized lighting for dusk atmosphere */}
      <FantasyDuskLighting />
      
      {/* Post-processing effects */}
      <FantasyPostProcessing />
    </group>
  );
};


import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyInfiniteTileSystem } from './FantasyInfiniteTileSystem';
import { FantasyDuskLighting } from './FantasyDuskLighting';
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
      {/* Infinite tiling system with individual GLB components */}
      <FantasyInfiniteTileSystem
        playerPosition={playerPosition}
        renderDistance={120}
      />
      
      {/* Specialized lighting for dusk atmosphere */}
      <FantasyDuskLighting />
      
      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#2d1b4e']} />
    </group>
  );
};

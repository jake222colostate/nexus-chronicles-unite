
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyReferenceEnvironment } from './FantasyReferenceEnvironment';
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
      {/* Use the new reference-based environment */}
      <FantasyReferenceEnvironment
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#1a0f2e']} />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#2d1b4e', 50, 200]} />
    </group>
  );
};

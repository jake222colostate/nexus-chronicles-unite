
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { CleanFantasyEnvironment } from './CleanFantasyEnvironment';
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
    <CleanFantasyEnvironment
      chunks={chunks}
      chunkSize={chunkSize}
      realm={realm}
      playerPosition={playerPosition}
    />
  );
};

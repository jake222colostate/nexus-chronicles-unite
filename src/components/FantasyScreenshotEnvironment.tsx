
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyEnvironmentOrchestrator } from './FantasyEnvironmentOrchestrator';
import { Vector3 } from 'three';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: Vector3;
}

export const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new Vector3(0, 0, 0)
}) => {
  return (
    <FantasyEnvironmentOrchestrator 
      chunks={chunks}
      chunkSize={chunkSize}
      realm={realm}
      playerPosition={playerPosition}
    />
  );
};

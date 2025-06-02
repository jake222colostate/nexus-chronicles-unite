
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyEnvironmentOrchestrator } from './FantasyEnvironmentOrchestrator';

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
  return (
    <FantasyEnvironmentOrchestrator 
      chunks={chunks}
      chunkSize={chunkSize}
      realm={realm}
    />
  );
};

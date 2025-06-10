
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { InfiniteEnvironmentSystem } from './InfiniteEnvironmentSystem';
import { EnhancedInfiniteGroundSystem } from './EnhancedInfiniteGroundSystem';
import { RockyForestPathSystem } from './RockyForestPathSystem';

interface OptimizedFantasyEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

export const OptimizedFantasyEnvironment: React.FC<OptimizedFantasyEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with infinite ground, rocky path, and tight valley`);

  return (
    <Suspense fallback={null}>
      {/* Infinite ground system for seamless terrain */}
      <EnhancedInfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* Rocky forest path system - infinite looping path */}
      <RockyForestPathSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Infinite environment system handles mountains and other elements */}
      <InfiniteEnvironmentSystem playerPosition={playerPosition} />
      
      {/* Tree system positioned within valley bounds */}
      <EnhancedTreeDistribution
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
    </Suspense>
  );
};

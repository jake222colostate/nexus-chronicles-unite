
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from './EnhancedTreeDistribution';
import { InfiniteEnvironmentSystem } from './InfiniteEnvironmentSystem';

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

  console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with natural mountain valley`);

  return (
    <Suspense fallback={null}>
      {/* Infinite environment system handles additional environmental elements */}
      <InfiniteEnvironmentSystem />
      
      {/* Tree system positioned within mountain valley bounds */}
      <EnhancedTreeDistribution
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
    </Suspense>
  );
};

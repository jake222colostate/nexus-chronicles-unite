
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from './EnhancedTreeDistribution';
import { InfiniteGroundSystem } from './InfiniteGroundSystem';
import { CenteredMountainSystem } from './CenteredMountainSystem';

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

  console.log(`OptimizedFantasyEnvironment: Rendering ${chunks.length} chunks with coordinated infinite terrain`);

  return (
    <Suspense fallback={null}>
      {/* Infinite ground system for seamless terrain */}
      <InfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Centered mountain system for straight-line infinite mountains */}
      <CenteredMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Tree system positioned within valley bounds */}
      <EnhancedTreeDistribution
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
    </Suspense>
  );
};

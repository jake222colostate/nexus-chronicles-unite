
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from './EnhancedTreeDistribution';
import { InfiniteEnvironmentSystem } from './InfiniteEnvironmentSystem';
import { ValleyPathSystem } from './ValleyPathSystem';

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

  console.log(`OptimizedFantasyEnvironment: Rendering with valley path system for fantasy realm`);

  return (
    <Suspense fallback={null}>
      {/* Valley Path System - runs through the central mountain valley */}
      <ValleyPathSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Infinite environment system handles additional environmental elements */}
      <InfiniteEnvironmentSystem />
      
      {/* Keep existing tree system as fallback for existing chunks */}
      <EnhancedTreeDistribution
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
    </Suspense>
  );
};

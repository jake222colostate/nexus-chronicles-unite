
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { EnhancedInfiniteGroundSystem } from './EnhancedInfiniteGroundSystem';
import { GLBMountainSystem } from './GLBMountainSystem';

interface OptimizedFantasyEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

export const OptimizedFantasyEnvironment: React.FC<OptimizedFantasyEnvironmentProps> = React.memo(({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // 60fps optimization - reduced logging
  if (chunks.length > 0) {
    console.log(`OptimizedFantasyEnvironment: ${chunks.length} chunks`);
  }

  return (
    <Suspense fallback={null}>
      {/* Infinite ground system for seamless terrain */}
      <EnhancedInfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* Mountain system for fantasy world boundaries */}
      <GLBMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Tree system positioned within valley bounds - reduced for 60fps */}
      {chunks.length <= 15 && (
        <EnhancedTreeDistribution
          chunks={chunks.slice(0, 10)} // Limit trees for 60fps
          chunkSize={chunkSize}
          realm={realm}
        />
      )}
    </Suspense>
  );
});


import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { InfiniteEnvironmentSystem } from './InfiniteEnvironmentSystem';
import { EnhancedInfiniteGroundSystem } from './EnhancedInfiniteGroundSystem';

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

  return (
    <Suspense fallback={null}>
      {/* OPTIMIZED: Simplified ground system only */}
      <EnhancedInfiniteGroundSystem
        chunks={chunks.slice(0, 20)} // Limit chunks for performance
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* OPTIMIZED: Conditional mountain system - only render when needed */}
      {Math.abs(playerPosition.x) > 30 && (
        <InfiniteEnvironmentSystem playerPosition={playerPosition} />
      )}
      
      {/* OPTIMIZED: Limited tree system */}
      <EnhancedTreeDistribution
        chunks={chunks.slice(0, 15)} // Further limit chunks for trees
        chunkSize={chunkSize}
        realm={realm}
      />
    </Suspense>
  );
});

OptimizedFantasyEnvironment.displayName = 'OptimizedFantasyEnvironment';

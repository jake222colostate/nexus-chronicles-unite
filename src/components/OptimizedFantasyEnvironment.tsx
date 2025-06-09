
import React, { Suspense } from 'react';
import { ChunkData } from './InfiniteChunkLoader';
import { ChunkData as ChunkSystemData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from './EnhancedTreeDistribution';
import { InfiniteEnvironmentSystem } from './InfiniteEnvironmentSystem';
import { InfiniteGroundSystem } from './InfiniteGroundSystem';

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

  console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with infinite ground and wider valley`);

  // Convert InfiniteChunkLoader ChunkData to ChunkSystem format for tree distribution
  const convertedChunks: ChunkSystemData[] = chunks.map(chunk => ({
    id: chunk.id,
    x: 0, // Centered on X axis
    z: chunk.index,
    worldX: 0,
    worldZ: chunk.worldZ,
    seed: Math.abs(chunk.index * 1000) % 10000
  }));

  return (
    <Suspense fallback={null}>
      {/* Infinite ground system for seamless terrain */}
      <InfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Infinite environment system handles additional environmental elements */}
      <InfiniteEnvironmentSystem />
      
      {/* Tree system positioned within valley bounds using converted chunks */}
      <EnhancedTreeDistribution
        chunks={convertedChunks}
        chunkSize={chunkSize}
        realm={realm}
      />
    </Suspense>
  );
};

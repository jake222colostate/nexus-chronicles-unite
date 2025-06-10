
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { InfiniteEnvironmentSystem } from './InfiniteEnvironmentSystem';
import { EnhancedInfiniteGroundSystem } from './EnhancedInfiniteGroundSystem';
import { RockyForestPathSystem } from './RockyForestPathSystem';
import { CrystalComponent } from './CrystalComponent';

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

  console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with wider paths and sky crystals`);

  return (
    <Suspense fallback={null}>
      {/* Infinite ground system for seamless terrain */}
      <EnhancedInfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* Rocky forest path system - wider, properly connected path */}
      <RockyForestPathSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Special sky crystal for the loading area */}
      <CrystalComponent
        position={[0, 20, 0]} 
        scale={[3, 3, 3]}
        animate={true}
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

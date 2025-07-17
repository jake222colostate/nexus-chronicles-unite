
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { EnhancedInfiniteGroundSystem } from './EnhancedInfiniteGroundSystem';
import { ForestEnvironmentSystem } from './ForestEnvironmentSystem';
import { SkeletonEnemySystem } from './SkeletonEnemySystem';

interface OptimizedFantasyEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
}

export const OptimizedFantasyEnvironment: React.FC<OptimizedFantasyEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with forest and skeleton systems`);

  return (
    <Suspense fallback={null}>
      {/* Infinite ground system for seamless terrain */}
      <EnhancedInfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* Tree system positioned within valley bounds */}
      <EnhancedTreeDistribution
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Forest environment with all assets */}
      <ForestEnvironmentSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />

      {/* Skeleton enemy system */}
      <SkeletonEnemySystem
        chunks={chunks}
        chunkSize={chunkSize}
        playerPosition={playerPosition}
        onEnemyCountChange={onEnemyCountChange}
        onEnemyKilled={onEnemyKilled}
        weaponDamage={weaponDamage}
        realm={realm}
      />
    </Suspense>
  );
};

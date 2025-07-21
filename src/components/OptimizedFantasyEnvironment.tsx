
import React, { Suspense } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { SeamlessGroundSystem } from './SeamlessGroundSystem';
import { ForestEnvironmentSystem } from './ForestEnvironmentSystem';
import { SkeletonEnemySystem } from './SkeletonEnemySystem';

interface OptimizedFantasyEnvironmentProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
  upgradesPurchased?: number;
  fogDistance: number;
}

export const OptimizedFantasyEnvironment: React.FC<OptimizedFantasyEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage,
  upgradesPurchased = 0,
  fogDistance
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with forest and skeleton systems`);

  return (
    <Suspense fallback={null}>
      {/* Seamless fog-based ground system */}
      <SeamlessGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
        fogDistance={fogDistance}
      />
      
      {/* Tree system disabled near spawn - was causing trees on path */}
      {playerPosition.z < -30 && (
        <EnhancedTreeDistribution
          chunks={chunks}
          chunkSize={chunkSize}
          realm={realm}
        />
      )}

      {/* Forest environment disabled near spawn - was causing trees on path */}
      {playerPosition.z < -30 && (
        <ForestEnvironmentSystem
          chunks={chunks}
          chunkSize={chunkSize}
          realm={realm}
          playerPosition={playerPosition}
        />
      )}

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

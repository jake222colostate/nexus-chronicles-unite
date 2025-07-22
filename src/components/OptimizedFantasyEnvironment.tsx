
import React, { Suspense } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';
import { OptimizedGLBTreeSystem } from './OptimizedGLBTreeSystem';
import { OptimizedMountainSystem } from './OptimizedMountainSystem';
import { OptimizedPathSystem } from './OptimizedPathSystem';
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

  // console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with forest and skeleton systems`);

  return (
    <Suspense fallback={null}>
      {/* Optimized GLB-based path system */}
      <OptimizedPathSystem
        playerPosition={playerPosition}
        chunksAhead={8}
        chunksBehind={2}
        chunkSize={chunkSize}
      />
      
      {/* Optimized GLB-based tree system with instancing */}
      <OptimizedGLBTreeSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />

      {/* Optimized GLB-based mountain system with LOD */}
      <OptimizedMountainSystem
        playerPosition={playerPosition}
        realm={realm}
      />

      {/* Seamless fog-based ground system */}
      <SeamlessGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
        fogDistance={fogDistance}
      />

      {/* Forest environment enabled ahead of player */}
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


import React, { Suspense } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';
// GLB-based decorative systems are disabled for now
// import { OptimizedGLBTreeSystem } from './OptimizedGLBTreeSystem';
// import { OptimizedMountainSystem } from './OptimizedMountainSystem';
// import { OptimizedPathSystem } from './OptimizedPathSystem';
import { SeamlessGroundSystem } from './SeamlessGroundSystem';
import { ProceduralMountainTerrain } from './ProceduralMountainTerrain';
import { SimpleTreeSystem } from './SimpleTreeSystem';
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

  const showDecorations = false;

  // console.log(`OptimizedFantasyEnvironment: Rendering fantasy realm with forest and skeleton systems`);

  return (
    <Suspense fallback={null}>
      {/* Decorative GLB systems temporarily disabled */}
      {showDecorations && (
        <>
          <OptimizedPathSystem
            playerPosition={playerPosition}
            chunksAhead={8}
            chunksBehind={2}
            chunkSize={chunkSize}
          />
          <OptimizedGLBTreeSystem
            chunks={chunks}
            chunkSize={chunkSize}
            realm={realm}
            playerPosition={playerPosition}
          />
          <OptimizedMountainSystem
            playerPosition={playerPosition}
            realm={realm}
          />
        </>
      )}

      {/* Seamless fog-based ground system */}
      <SeamlessGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
        fogDistance={fogDistance}
      />

      {/* Procedural mountains */}
      <ProceduralMountainTerrain
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Simple trees ahead of player */}
      <SimpleTreeSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
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

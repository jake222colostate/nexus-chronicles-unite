
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { GradientPathTerrain } from './GradientPathTerrain';
import { GradientGlowTrees } from './GradientGlowTrees';
import { FantasyMountains } from './FantasyMountains';
import { MagicParticles } from './MagicParticles';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = React.memo(({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('FantasyScreenshotEnvironment render - Realm:', realm);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyScreenshotEnvironment: Not fantasy realm, skipping');
    return null;
  }

  return (
    <group>
      {/* New Gradient Path Terrain */}
      <GradientPathTerrain />

      {/* New Gradient Glow Trees */}
      <GradientGlowTrees />

      {/* New Fantasy Mountains */}
      <FantasyMountains />

      {/* New Magic Particles */}
      <MagicParticles />

      {/* Enhanced fog for atmosphere */}
      <fog attach="fog" args={['#2d1b69', 30, 120]} />
    </group>
  );
});

FantasyScreenshotEnvironment.displayName = 'FantasyScreenshotEnvironment';

export { FantasyScreenshotEnvironment };


import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyTerrainSystem } from './FantasyTerrainSystem';
import { FantasyMagicalTreeSystem } from './FantasyMagicalTreeSystem';
import { FantasyPolygonalMountainSystem } from './FantasyPolygonalMountainSystem';
import { FantasyAtmosphereSystem } from './FantasyAtmosphereSystem';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = React.memo(({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {/* Terrain Module - Optimized hexagonal tiles */}
      <FantasyTerrainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Tree Module - Reduced density for better performance */}
      <FantasyMagicalTreeSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Mountain Module - Optimized polygonal mountains */}
      <FantasyPolygonalMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Atmosphere Module - Reduced particle count */}
      <FantasyAtmosphereSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
    </group>
  );
});

FantasyScreenshotEnvironment.displayName = 'FantasyScreenshotEnvironment';

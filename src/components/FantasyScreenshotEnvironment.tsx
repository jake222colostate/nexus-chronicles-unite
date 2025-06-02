
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyTerrainSystem } from './FantasyTerrainSystem';
import { FantasyMagicalTreeSystem } from './FantasyMagicalTreeSystem';
import { FantasyPolygonalMountainSystem } from './FantasyPolygonalMountainSystem';
import { FantasyStonePortalSystem } from './FantasyStonePortalSystem';
import { FantasyAtmosphereSystem } from './FantasyAtmosphereSystem';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  onTierProgression?: () => void;
}

export const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  onTierProgression
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {/* Terrain Module - Hexagonal tiles with dirt/grass textures */}
      <FantasyTerrainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Tree Module - Magical trees with glow effects */}
      <FantasyMagicalTreeSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Mountain Module - Polygonal mountains with crystals */}
      <FantasyPolygonalMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Portal Module - Stone portals with glowing runes */}
      <FantasyStonePortalSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        onTierProgression={onTierProgression}
      />

      {/* Atmosphere Module - Fog, particles, and ambient lighting */}
      <FantasyAtmosphereSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.4} color="#E6E6FA" />
      <directionalLight
        position={[30, 60, 30]}
        intensity={0.8}
        color="#DDA0DD"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={1200}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      
      {/* Additional atmospheric lights */}
      <directionalLight
        position={[-20, 40, 20]}
        intensity={0.3}
        color="#FF69B4"
      />
      
      <directionalLight
        position={[15, 35, -15]}
        intensity={0.25}
        color="#00FFFF"
      />
    </group>
  );
};

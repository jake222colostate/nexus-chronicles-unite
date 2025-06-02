
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyGround } from './FantasyGround';
import { FantasyTreesWithGlow } from './FantasyTreesWithGlow';
import { FantasyMagicalMountains } from './FantasyMagicalMountains';

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
      {/* Fantasy ground with hills */}
      <FantasyGround />

      {/* Glowing fantasy trees */}
      <FantasyTreesWithGlow />

      {/* Magical mountains with crystals */}
      <FantasyMagicalMountains />

      {/* Enhanced fog for magical atmosphere */}
      <fog attach="fog" args={['#1b0036', 15, 150]} />
      
      {/* Ambient magical lighting */}
      <ambientLight intensity={0.6} color="#E6E6FA" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
    </group>
  );
});

FantasyScreenshotEnvironment.displayName = 'FantasyScreenshotEnvironment';

export { FantasyScreenshotEnvironment };

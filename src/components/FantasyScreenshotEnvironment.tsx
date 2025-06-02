
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
      {/* Magical ground with stone pathway */}
      <FantasyGround />

      {/* Glowing magical trees */}
      <FantasyTreesWithGlow />

      {/* Crystal-infused mountains */}
      <FantasyMagicalMountains />

      {/* Ground-level purple fog */}
      <fog attach="fog" args={['#38245c', 50, 200]} />
      
      {/* Atmospheric lighting */}
      <ambientLight intensity={0.4} color="#4c1b70" />
      <directionalLight
        position={[10, 30, 10]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Soft fill light for crystal glow */}
      <pointLight 
        position={[0, 15, -50]}
        color="#00ffff"
        intensity={0.3}
        distance={100}
      />
    </group>
  );
});

FantasyScreenshotEnvironment.displayName = 'FantasyScreenshotEnvironment';

export { FantasyScreenshotEnvironment };

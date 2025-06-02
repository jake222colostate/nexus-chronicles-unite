
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyGround } from './FantasyGround';
import { FantasyTreesWithGlow } from './FantasyTreesWithGlow';
import { FantasyMagicalMountains } from './FantasyMagicalMountains';
import { FantasyPortalGateway } from './FantasyPortalGateway';

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
      {/* Magical ground with stepping stone pathway */}
      <FantasyGround />

      {/* Lush magical trees */}
      <FantasyTreesWithGlow />

      {/* Pink/purple crystalline mountains with cyan crystals */}
      <FantasyMagicalMountains />

      {/* Portal gateway in the distance */}
      <FantasyPortalGateway />

      {/* Enhanced atmospheric lighting to match reference */}
      <ambientLight intensity={0.6} color="#E6E6FA" />
      <directionalLight
        position={[10, 30, 10]}
        intensity={1.0}
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
      
      {/* Magical cyan accent lighting */}
      <pointLight 
        position={[0, 15, -50]}
        color="#00FFFF"
        intensity={0.4}
        distance={100}
      />
      
      {/* Warm orange lighting from the pathway */}
      <pointLight 
        position={[0, 2, -20]}
        color="#FF8C00"
        intensity={0.3}
        distance={40}
      />
    </group>
  );
});

FantasyScreenshotEnvironment.displayName = 'FantasyScreenshotEnvironment';

export { FantasyScreenshotEnvironment };

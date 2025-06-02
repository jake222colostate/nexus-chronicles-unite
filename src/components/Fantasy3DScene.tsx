
import React, { Suspense } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { FantasyScreenshotEnvironment } from './FantasyScreenshotEnvironment';
import { FantasyScreenshotSkybox } from './FantasyScreenshotSkybox';

interface Fantasy3DSceneProps {
  cameraPosition: Vector3;
  onPositionChange: (position: Vector3) => void;
  realm: 'fantasy' | 'scifi';
  maxUnlockedUpgrade: number;
  upgradeSpacing: number;
  onTierProgression: () => void;
  chunkSize: number;
  renderDistance: number;
}

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = React.memo(({
  cameraPosition,
  onPositionChange,
  realm,
  chunkSize,
  renderDistance
}) => {
  return (
    <Suspense fallback={null}>
      <Enhanced360Controller
        position={[0, 1.6, 0]}
        onPositionChange={onPositionChange}
      />

      {/* Fantasy Screenshot Skybox */}
      <FantasyScreenshotSkybox realm={realm} />

      {/* Optimized lighting setup */}
      <ambientLight intensity={0.5} color="#E6E6FA" />
      <directionalLight
        position={[20, 40, 20]}
        intensity={0.8}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={800}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      {/* Optimized chunk system with larger chunks for better performance */}
      <ChunkSystem
        playerPosition={cameraPosition}
        chunkSize={chunkSize}
        renderDistance={renderDistance}
      >
        {(chunks: ChunkData[]) => (
          <FantasyScreenshotEnvironment
            chunks={chunks}
            chunkSize={chunkSize}
            realm={realm}
          />
        )}
      </ChunkSystem>

      {/* Simplified dynamic player light */}
      <pointLight 
        position={[cameraPosition.x, 8, cameraPosition.z - 5]} 
        intensity={0.6}
        color="#DDA0DD" 
        distance={30} 
      />

      {/* Optimized contact shadows */}
      <ContactShadows 
        position={[0, -0.45, cameraPosition.z]} 
        opacity={0.2} 
        scale={60} 
        blur={2} 
        far={15} 
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';

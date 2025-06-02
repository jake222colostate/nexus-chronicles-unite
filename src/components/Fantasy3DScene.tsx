
import React, { Suspense } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { FantasyScreenshotEnvironment } from './FantasyScreenshotEnvironment';

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
      {/* Camera controller with proper character height */}
      <Enhanced360Controller
        position={[0, 1.7, -10]}
        onPositionChange={onPositionChange}
      />

      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#2d1b4e']} />

      {/* Heavily optimized chunk system for 60fps */}
      <ChunkSystem
        playerPosition={cameraPosition}
        chunkSize={Math.max(chunkSize, 75)} // Larger chunks = fewer objects
        renderDistance={Math.min(renderDistance, 150)} // Limit to 2 chunks max
      >
        {(chunks: ChunkData[]) => (
          <FantasyScreenshotEnvironment
            chunks={chunks.slice(0, 4)} // Maximum 4 chunks for 60fps
            chunkSize={chunkSize}
            realm={realm}
            playerPosition={cameraPosition}
          />
        )}
      </ChunkSystem>

      {/* Simplified contact shadows - reduced performance impact */}
      <ContactShadows 
        position={[0, -1.4, cameraPosition.z]} 
        opacity={0.1} 
        scale={20} 
        blur={0.5} 
        far={6} 
        frames={1} // Static shadows for better performance
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';

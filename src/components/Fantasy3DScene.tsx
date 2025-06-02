
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
      {/* Camera controller */}
      <Enhanced360Controller
        position={[0, 1.6, 0]}
        onPositionChange={onPositionChange}
      />

      {/* Fantasy skybox with gradient and sparkles */}
      <FantasyScreenshotSkybox realm={realm} />

      {/* Background color */}
      <color attach="background" args={['#1b0036']} />

      {/* Chunk system for terrain generation */}
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

      {/* Dynamic player light */}
      <pointLight 
        position={[cameraPosition.x, 8, cameraPosition.z - 5]} 
        intensity={0.6}
        color="#DDA0DD" 
        distance={30} 
      />

      {/* Contact shadows for better grounding */}
      <ContactShadows 
        position={[0, -1.4, cameraPosition.z]} 
        opacity={0.3} 
        scale={60} 
        blur={2} 
        far={15} 
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';

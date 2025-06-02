
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
      {/* Camera controller with lower starting position */}
      <Enhanced360Controller
        position={[0, 2, 12]}
        onPositionChange={onPositionChange}
      />

      {/* Fantasy skybox with gradient and sparkles */}
      <FantasyScreenshotSkybox realm={realm} />

      {/* Background color */}
      <color attach="background" args={['#130c30']} />

      {/* Enhanced fog for magical atmosphere */}
      <fog attach="fog" args={['#130c30', 15, 150]} />

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

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.6} color="#E6E6FA" />
      <directionalLight
        position={[15, 40, 20]}
        intensity={1.2}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

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

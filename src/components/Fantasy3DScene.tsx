
import React, { Suspense } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { FantasyScreenshotEnvironment } from './FantasyScreenshotEnvironment';
import { FantasyScreenshotSkybox } from './FantasyScreenshotSkybox';
import { FantasyPortalSystem } from './FantasyPortalSystem';

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

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = ({
  cameraPosition,
  onPositionChange,
  realm,
  maxUnlockedUpgrade,
  upgradeSpacing,
  onTierProgression,
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

      {/* Enhanced magical lighting */}
      <ambientLight intensity={0.6} color="#E6E6FA" />
      <directionalLight
        position={[20, 40, 20]}
        intensity={1.0}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={1200}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />
      
      {/* Magical colored lights */}
      <directionalLight
        position={[-15, 25, 15]}
        intensity={0.4}
        color="#FF69B4"
      />
      
      <directionalLight
        position={[10, 30, -10]}
        intensity={0.3}
        color="#00FFFF"
      />

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

      {/* Fantasy Portal System */}
      <FantasyPortalSystem
        playerPosition={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
        maxUnlockedUpgrade={maxUnlockedUpgrade}
        upgradeSpacing={upgradeSpacing}
        realm={realm}
        onTierProgression={onTierProgression}
      />

      {/* Dynamic player light */}
      <pointLight 
        position={[cameraPosition.x, 10, cameraPosition.z - 8]} 
        intensity={0.8}
        color="#DDA0DD" 
        distance={40} 
      />

      <ContactShadows 
        position={[0, -0.45, cameraPosition.z]} 
        opacity={0.3} 
        scale={100} 
        blur={3} 
        far={25} 
      />
    </Suspense>
  );
};

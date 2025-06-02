
import React, { Suspense } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { FantasyMountainSystem } from './FantasyMountainSystem';
import { FantasyTreeSystem } from './FantasyTreeSystem';
import { FantasyRoadSystem } from './FantasyRoadSystem';
import { FantasyPathSystem } from './FantasyPathSystem';
import { FantasyPortalSystem } from './FantasyPortalSystem';
import { FantasySkyboxSystem } from './FantasySkyboxSystem';

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

      {/* Fantasy Skybox System */}
      <FantasySkyboxSystem realm={realm} />

      {/* Enhanced lighting for fantasy atmosphere */}
      <ambientLight intensity={0.8} color="#E6E6FA" />
      <directionalLight
        position={[20, 30, 20]}
        intensity={1.2}
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
      
      <directionalLight
        position={[-15, 25, 15]}
        intensity={0.6}
        color="#DDA0DD"
      />

      <ChunkSystem
        playerPosition={cameraPosition}
        chunkSize={chunkSize}
        renderDistance={renderDistance}
      >
        {(chunks: ChunkData[]) => (
          <>
            {/* Fantasy Road System */}
            <FantasyRoadSystem
              chunks={chunks}
              chunkSize={chunkSize}
              realm={realm}
            />
            
            {/* Fantasy Path System */}
            <FantasyPathSystem
              chunks={chunks}
              chunkSize={chunkSize}
              realm={realm}
            />
            
            {/* Fantasy Mountains - High poly models */}
            <FantasyMountainSystem
              chunks={chunks}
              chunkSize={chunkSize}
              realm={realm}
            />

            {/* Fantasy Tree System - High poly models */}
            <FantasyTreeSystem
              chunks={chunks}
              chunkSize={chunkSize}
              realm={realm}
            />
          </>
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

      <pointLight 
        position={[cameraPosition.x, 10, cameraPosition.z - 8]} 
        intensity={1.0}
        color="#DDA0DD" 
        distance={50} 
      />

      <ContactShadows 
        position={[0, -0.45, cameraPosition.z]} 
        opacity={0.5} 
        scale={80} 
        blur={2.5} 
        far={20} 
      />
    </Suspense>
  );
};

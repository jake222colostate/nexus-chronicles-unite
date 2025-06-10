
import React, { Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import { OptimizedFantasyMountainSystem } from './OptimizedFantasyMountainSystem';
import { InfiniteGroundSystem } from './InfiniteGroundSystem';

interface CleanFantasyEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

export const CleanFantasyEnvironment: React.FC<CleanFantasyEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  console.log(`CleanFantasyEnvironment: Rendering optimized fantasy realm with controlled mountain placement at ±18 units`);

  return (
    <Suspense fallback={null}>
      {/* Infinite ground system for seamless terrain */}
      <InfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Optimized mountain system with controlled placement and no random trees */}
      <OptimizedFantasyMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Fantasy realm lighting */}
      <ambientLight intensity={0.4} color="#8B7AB8" />
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.8}
        color="#F0E6FF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Fantasy atmosphere */}
      <color attach="background" args={['#2D1B3D']} />
      <fog attach="fog" args={['#3D2B4D', 40, 120]} />
    </Suspense>
  );
};

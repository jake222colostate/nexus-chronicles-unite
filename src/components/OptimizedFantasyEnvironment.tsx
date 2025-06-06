
import React from 'react';
import { Vector3 } from 'three';
import { ChunkData } from './ChunkSystem';
import { SimpleTreeSystem } from './SimpleTreeSystem';
import { SimpleMountainSystem } from './SimpleMountainSystem';

interface OptimizedFantasyEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

export const OptimizedFantasyEnvironment: React.FC<OptimizedFantasyEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Filter chunks for performance - only render nearby chunks
  const nearbyChunks = chunks.filter(chunk => {
    const distance = Math.sqrt(
      Math.pow(chunk.worldX - playerPosition.x, 2) + 
      Math.pow(chunk.worldZ - playerPosition.z, 2)
    );
    return distance <= 120; // Only render chunks within 120 units
  });

  return (
    <group>
      {/* Simple ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, playerPosition.z]} receiveShadow>
        <planeGeometry args={[200, 400]} />
        <meshLambertMaterial color="#2a4a2a" />
      </mesh>

      {/* Simple path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, playerPosition.z]} receiveShadow>
        <planeGeometry args={[6, 400]} />
        <meshLambertMaterial color="#4a3c28" />
      </mesh>

      {/* Optimized trees */}
      <SimpleTreeSystem
        chunks={nearbyChunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Optimized mountains */}
      <SimpleMountainSystem
        chunks={nearbyChunks}
        chunkSize={chunkSize}
        realm={realm}
      />

      {/* Basic lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
};

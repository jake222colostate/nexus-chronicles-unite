
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';

interface FantasyEnvironmentOrchestratorProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: Vector3;
  onEnemyPositionUpdate?: (positions: Vector3[]) => void;
}

export const FantasyEnvironmentOrchestrator: React.FC<FantasyEnvironmentOrchestratorProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new Vector3(0, 0, 0),
  onEnemyPositionUpdate
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  console.log('FantasyEnvironmentOrchestrator: ULTRA-MINIMAL rendering for 60 FPS');

  return (
    <group>
      {/* MINIMAL: Just basic ground and background for 60 FPS */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d4a2d" />
      </mesh>
      
      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#1a0f2e']} />
      
      {/* REMOVED: All complex systems for maximum 60 FPS performance */}
    </group>
  );
};

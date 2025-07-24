
import React from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { SeamlessGroundSystem } from './SeamlessGroundSystem';
import { SimpleSkybox } from './SimpleSkybox';
import { ContinuousMountainSystem } from './ContinuousMountainSystem';
import { Vector3 } from 'three';

interface FantasyEnvironmentOrchestratorProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: Vector3;
  onEnemyPositionUpdate?: (positions: Vector3[]) => void;
  fogDistance: number;
}

export const FantasyEnvironmentOrchestrator: React.FC<FantasyEnvironmentOrchestratorProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new Vector3(0, 0, 0),
  onEnemyPositionUpdate,
  fogDistance
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  console.log('FantasyEnvironmentOrchestrator: Rendering with enhanced visibility fixes and infinite terrain');

  return (
    <group>
      {/* Bright blue sky background */}
      <SimpleSkybox realm={realm} />
      
      {/* Bright daylight lighting system like reference image */}
      <ambientLight intensity={0.8} color="#FFFFFF" />
      <directionalLight
        position={[50, 100, 30]}
        intensity={2.0}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />
      
      {/* Additional fill light for bright cheerful atmosphere */}
      <directionalLight
        position={[-30, 60, 20]}
        intensity={0.8}
        color="#E3F2FD"
        castShadow={false}
      />
      
      {/* Mountain corridor system */}
      <ContinuousMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* Seamless fog-based ground system */}
      <SeamlessGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
        fogDistance={fogDistance}
      />
      
      {/* ONLY use EnhancedTreeDistribution with visibility fixes */}
      <EnhancedTreeDistribution
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Very light atmospheric fog for depth - matches bright reference image */}
      <fog attach="fog" args={['#E6F3FF', 200, 400]} />
    </group>
  );
};

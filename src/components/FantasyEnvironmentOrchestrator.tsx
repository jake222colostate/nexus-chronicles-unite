
import React from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { SeamlessGroundSystem } from './SeamlessGroundSystem';
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
      
      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#1a0f2e']} />
      
      {/* Enhanced atmospheric fog with longer range */}
      <fog attach="fog" args={['#2d1b4e', 50, 300]} />
    </group>
  );
};

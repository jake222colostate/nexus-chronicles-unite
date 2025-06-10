
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { ContinuousMountainSystem } from './ContinuousMountainSystem';
import { EnhancedTreeDistribution } from './EnhancedTreeDistribution';
import { EnhancedInfiniteGroundSystem } from './EnhancedInfiniteGroundSystem';
import { Vector3 } from 'three';

interface FantasyEnvironmentOrchestratorProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: Vector3;
}

export const FantasyEnvironmentOrchestrator: React.FC<FantasyEnvironmentOrchestratorProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new Vector3(0, 0, 0)
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  console.log('FantasyEnvironmentOrchestrator: Rendering with enhanced visibility fixes and infinite terrain');

  return (
    <group>
      {/* Enhanced infinite ground system - renders first to ensure base layer */}
      <EnhancedInfiniteGroundSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
      />
      
      {/* Continuous mountain system positioned closer with terrain hole fixes */}
      <ContinuousMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
        playerPosition={playerPosition}
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

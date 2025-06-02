
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { CartoonFantasyTerrain } from './CartoonFantasyTerrain';
import { CartoonMagicalPathway } from './CartoonMagicalPathway';

interface FantasyEnvironmentOrchestratorProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyEnvironmentOrchestrator: React.FC<FantasyEnvironmentOrchestratorProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {/* Cartoon-style rolling terrain */}
      <CartoonFantasyTerrain 
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Magical winding pathway */}
      <CartoonMagicalPathway 
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Enhanced lighting for cartoon feel */}
      <ambientLight intensity={0.8} color="#FFE4E1" />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1.0}
        color="#FFFACD"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Additional warm rim lighting */}
      <directionalLight 
        position={[-20, 20, -10]} 
        intensity={0.4}
        color="#FF69B4"
      />
    </group>
  );
};

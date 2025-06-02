
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { CartoonFantasyTerrain } from './CartoonFantasyTerrain';
import { CartoonMagicalPathway } from './CartoonMagicalPathway';
import { CartoonMagicalCrystals } from './CartoonMagicalCrystals';
import { CartoonMountainSystem } from './CartoonMountainSystem';
import { CartoonStoneArchway } from './CartoonStoneArchway';
import { CartoonMagicalTrees } from './CartoonMagicalTrees';

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
      {/* Base terrain with rolling hills */}
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
      
      {/* Magical floating crystals */}
      <CartoonMagicalCrystals
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Background mountains */}
      <CartoonMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Magical cartoon trees */}
      <CartoonMagicalTrees
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Stone archway portal */}
      <CartoonStoneArchway realm={realm} />
      
      {/* Enhanced atmospheric lighting */}
      <ambientLight intensity={0.7} color="#FFE4E1" />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1.2}
        color="#FFFACD"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Additional magical rim lighting */}
      <directionalLight 
        position={[-20, 20, -10]} 
        intensity={0.5}
        color="#FF69B4"
      />
      
      {/* Atmospheric point light for mystical feel */}
      <pointLight
        position={[0, 10, -30]}
        color="#DDA0DD"
        intensity={0.8}
        distance={100}
      />
    </group>
  );
};


import React from 'react';
import { ChunkData } from './ChunkSystem';

interface FantasyAtmosphereSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyAtmosphereSystem: React.FC<FantasyAtmosphereSystemProps> = ({
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
      {/* Basic fog only */}
      <fog attach="fog" args={['#87CEEB', 50, 150]} />
      
      {/* Simple ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
    </group>
  );
};

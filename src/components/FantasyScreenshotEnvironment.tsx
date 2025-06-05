
import React, { Suspense } from 'react';
import { Vector3 } from 'three';
import { ChunkData } from './ChunkSystem';
import { CleanPathSystem } from './CleanPathSystem';
import { BoundaryMountainSystem } from './BoundaryMountainSystem';
import { FantasyRealisticTreeSystem } from './FantasyRealisticTreeSystem';
import { ImprovedFantasyLighting } from './ImprovedFantasyLighting';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

export const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Aggressive performance optimization - limit chunks based on distance
  const nearChunks = chunks.filter(chunk => {
    const distance = Math.sqrt(
      Math.pow(chunk.worldX - playerPosition.x, 2) + 
      Math.pow(chunk.worldZ - playerPosition.z, 2)
    );
    return distance <= 120; // Further reduced render distance
  }).slice(0, 12); // Hard limit to 12 chunks maximum

  // Calculate chunk center for tree system
  const chunkCenter = new Vector3(0, 0, playerPosition.z);

  return (
    <Suspense fallback={null}>
      {/* Add proper lighting first */}
      <ImprovedFantasyLighting />
      
      {/* Essential path system - always render */}
      <CleanPathSystem 
        chunks={nearChunks} 
        chunkSize={chunkSize} 
        realm={realm} 
      />
      
      {/* Simplified boundary mountains - reduced complexity */}
      <BoundaryMountainSystem 
        chunks={nearChunks.slice(0, 6)} // Even fewer chunks for mountains
        chunkSize={chunkSize} 
        realm={realm} 
      />
      
      {/* New realistic tree system with GLB models */}
      <FantasyRealisticTreeSystem chunkCenter={chunkCenter} />
    </Suspense>
  );
};

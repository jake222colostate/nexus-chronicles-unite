import React, { useMemo } from 'react';
import { Vector3 } from 'three';

export interface FantasyChunkData {
  id: string;
  x: number;
  z: number;
  worldX: number;
  worldZ: number;
  seed: number;
  visible: boolean;
  opacity: number;
}

interface NewFantasyChunkSystemProps {
  playerPosition: Vector3;
  chunkSize: number;
  renderDistance: number;
  children: (chunks: FantasyChunkData[]) => React.ReactNode;
}

export const NewFantasyChunkSystem: React.FC<NewFantasyChunkSystemProps> = ({
  playerPosition,
  chunkSize,
  renderDistance,
  children
}) => {
  const chunks = useMemo(() => {
    const activeChunks: FantasyChunkData[] = [];
    
    // Calculate chunk grid based on player position
    const playerChunkX = Math.floor(playerPosition.x / chunkSize);
    const playerChunkZ = Math.floor(Math.abs(playerPosition.z) / chunkSize);
    
    // Generate chunks in a grid around the player
    const chunksPerSide = Math.ceil(renderDistance / chunkSize) + 2;
    
    for (let x = playerChunkX - chunksPerSide; x <= playerChunkX + chunksPerSide; x++) {
      for (let z = playerChunkZ - chunksPerSide; z <= playerChunkZ + chunksPerSide; z++) {
        const worldX = x * chunkSize;
        const worldZ = -z * chunkSize; // Negative for forward progression
        
        // Calculate distance from player for visibility
        const distance = Math.sqrt(
          Math.pow(worldX - playerPosition.x, 2) + 
          Math.pow(worldZ - playerPosition.z, 2)
        );
        
        if (distance <= renderDistance) {
          // Calculate opacity based on distance for fog effect
          const opacity = Math.max(0.1, 1 - (distance / renderDistance));
          
          activeChunks.push({
            id: `chunk_${x}_${z}`,
            x,
            z,
            worldX,
            worldZ,
            seed: Math.abs(x * 1000 + z * 100),
            visible: true,
            opacity
          });
        }
      }
    }
    
    console.log(`NewFantasyChunkSystem: Generated ${activeChunks.length} chunks`);
    return activeChunks;
  }, [playerPosition.x, playerPosition.z, chunkSize, renderDistance]);

  return <>{children(chunks)}</>;
};
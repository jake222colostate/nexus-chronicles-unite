
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

export interface ChunkData {
  id: string;
  index: number;
  worldZ: number;
  isLoaded: boolean;
}

interface InfiniteChunkLoaderProps {
  playerPosition: Vector3;
  chunkSize: number;
  renderDistance: number;
  children: (chunks: ChunkData[]) => React.ReactNode;
}

export const InfiniteChunkLoader: React.FC<InfiniteChunkLoaderProps> = ({
  playerPosition,
  chunkSize,
  renderDistance,
  children
}) => {
  const [activeChunks, setActiveChunks] = useState<ChunkData[]>([]);
  const lastPlayerZ = useRef(0);
  const lastUpdateTime = useRef(0);
  const UPDATE_INTERVAL = 500; // Update every 500ms

  // Memoized chunk management
  const manageChunks = useCallback((playerZ: number) => {
    const currentChunkIndex = Math.floor(-playerZ / chunkSize);
    const chunksAhead = Math.ceil(renderDistance / chunkSize);
    const chunksBehind = 2; // Keep 2 chunks behind for smooth experience
    
    const requiredChunks: ChunkData[] = [];
    
    // Generate chunks from behind to ahead
    for (let i = currentChunkIndex - chunksBehind; i <= currentChunkIndex + chunksAhead; i++) {
      const worldZ = -i * chunkSize;
      requiredChunks.push({
        id: `chunk_${i}`,
        index: i,
        worldZ,
        isLoaded: true
      });
    }
    
    console.log(`InfiniteChunkLoader: Managing ${requiredChunks.length} chunks for player at Z: ${playerZ}`);
    return requiredChunks;
  }, [chunkSize, renderDistance]);

  // Throttled chunk updates
  useFrame(() => {
    const now = Date.now();
    const currentPlayerZ = Math.floor(playerPosition.z / 5) * 5; // Round to reduce updates
    
    if (
      Math.abs(currentPlayerZ - lastPlayerZ.current) > 10 || // Player moved significantly
      now - lastUpdateTime.current > UPDATE_INTERVAL // Time-based update
    ) {
      const newChunks = manageChunks(currentPlayerZ);
      setActiveChunks(newChunks);
      lastPlayerZ.current = currentPlayerZ;
      lastUpdateTime.current = now;
    }
  });

  return <>{children(activeChunks)}</>;
};

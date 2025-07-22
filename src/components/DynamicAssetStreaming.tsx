import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SpatialPartitioningSystem } from '../systems/SpatialPartitioningSystem';

interface DynamicAssetStreamingProps {
  playerPosition: Vector3;
  streamingDistance: number;
  chunkSize: number;
  onChunkLoad?: (chunkKey: string) => void;
  onChunkUnload?: (chunkKey: string) => void;
  children: (loadedChunks: Set<string>, spatialSystem: SpatialPartitioningSystem) => React.ReactNode;
}

export const DynamicAssetStreaming: React.FC<DynamicAssetStreamingProps> = ({
  playerPosition,
  streamingDistance,
  chunkSize,
  onChunkLoad,
  onChunkUnload,
  children
}) => {
  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set());
  const previousPlayerChunk = useRef<{ x: number; z: number } | null>(null);
  const loadingQueue = useRef<Set<string>>(new Set());
  
  // Create spatial partitioning system
  const spatialSystem = useMemo(() => {
    return new SpatialPartitioningSystem({
      minX: -1000,
      maxX: 1000,
      minZ: -1000,
      maxZ: 1000
    });
  }, []);

  // Calculate required chunks based on player position
  const getRequiredChunks = (playerPos: Vector3): Set<string> => {
    const chunks = new Set<string>();
    const playerChunkX = Math.floor(playerPos.x / chunkSize);
    const playerChunkZ = Math.floor(playerPos.z / chunkSize);
    const chunkRadius = Math.ceil(streamingDistance / chunkSize);

    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius; x++) {
      for (let z = playerChunkZ - chunkRadius; z <= playerChunkZ + chunkRadius; z++) {
        const distance = Math.sqrt(
          Math.pow((x * chunkSize) - playerPos.x, 2) + 
          Math.pow((z * chunkSize) - playerPos.z, 2)
        );
        
        if (distance <= streamingDistance) {
          chunks.add(`${x},${z}`);
        }
      }
    }

    return chunks;
  };

  // Load chunk asynchronously
  const loadChunk = async (chunkKey: string) => {
    if (loadingQueue.current.has(chunkKey) || loadedChunks.has(chunkKey)) {
      return;
    }

    loadingQueue.current.add(chunkKey);
    
    try {
      // Simulate async loading delay (replace with actual GLB loading)
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setLoadedChunks(prev => {
        const newSet = new Set(prev);
        newSet.add(chunkKey);
        return newSet;
      });
      
      onChunkLoad?.(chunkKey);
    } catch (error) {
      console.warn(`Failed to load chunk ${chunkKey}:`, error);
    } finally {
      loadingQueue.current.delete(chunkKey);
    }
  };

  // Unload chunk
  const unloadChunk = (chunkKey: string) => {
    setLoadedChunks(prev => {
      const newSet = new Set(prev);
      newSet.delete(chunkKey);
      return newSet;
    });
    onChunkUnload?.(chunkKey);
  };

  // Update chunk loading based on player movement
  useFrame(() => {
    const currentChunkX = Math.floor(playerPosition.x / chunkSize);
    const currentChunkZ = Math.floor(playerPosition.z / chunkSize);
    const currentChunk = { x: currentChunkX, z: currentChunkZ };

    // Only update if player moved to a different chunk
    if (!previousPlayerChunk.current || 
        previousPlayerChunk.current.x !== currentChunk.x || 
        previousPlayerChunk.current.z !== currentChunk.z) {
      
      const requiredChunks = getRequiredChunks(playerPosition);
      
      // Load new chunks
      for (const chunkKey of requiredChunks) {
        if (!loadedChunks.has(chunkKey) && !loadingQueue.current.has(chunkKey)) {
          loadChunk(chunkKey);
        }
      }
      
      // Unload distant chunks
      for (const chunkKey of loadedChunks) {
        if (!requiredChunks.has(chunkKey)) {
          unloadChunk(chunkKey);
        }
      }
      
      previousPlayerChunk.current = currentChunk;
    }
  });

  return <>{children(loadedChunks, spatialSystem)}</>;
};
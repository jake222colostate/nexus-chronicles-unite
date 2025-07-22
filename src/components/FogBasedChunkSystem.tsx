import React, { useMemo, useRef } from 'react';
import { Vector3, FogExp2 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface FogBasedChunkSystemProps {
  playerPosition: Vector3;
  chunkSize: number;
  renderDistance: number;
  fogNear: number;
  fogFar: number;
  children: (chunkData: FogChunkData[], fogDistance: number) => React.ReactNode;
}

export interface FogChunkData {
  id: string;
  x: number;
  z: number;
  worldX: number;
  worldZ: number;
  seed: number;
  distanceToPlayer: number;
  fogOpacity: number;
  isVisible: boolean;
}

export const FogBasedChunkSystem: React.FC<FogBasedChunkSystemProps> = React.memo(({
  playerPosition,
  chunkSize,
  renderDistance,
  fogNear,
  fogFar,
  children
}) => {
  const { scene } = useThree();
  const fogRef = useRef<FogExp2 | null>(null);

  // Set up exponential fog for smooth transitions
  React.useEffect(() => {
    const fog = new FogExp2(0x2d1b69, 0.005); // Dark purple fog matching the sky
    scene.fog = fog;
    fogRef.current = fog;

    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Update fog based on player movement
  useFrame(() => {
    if (fogRef.current) {
      // Dynamically adjust fog density based on movement speed
      const fogDensity = Math.min(0.008, 0.003 + Math.abs(playerPosition.z) * 0.000001);
      fogRef.current.density = fogDensity;
    }
  });

  const activeChunks = useMemo(() => {
    const chunks: FogChunkData[] = [];
    
    // More responsive position rounding for smooth transitions
    const roundedPlayerX = Math.round(playerPosition.x / 10) * 10;
    const roundedPlayerZ = Math.round(Math.abs(playerPosition.z) / 10) * 10;
    
    const playerChunkX = Math.floor(roundedPlayerX / chunkSize);
    const playerChunkZ = Math.floor(roundedPlayerZ / chunkSize);
    
    // Fog-based rendering distances
    const maxRenderDistance = renderDistance * 1.5; // Extend beyond visible range
    const fogStartDistance = fogNear;
    const fogEndDistance = fogFar;
    const chunkRadius = Math.ceil(maxRenderDistance / chunkSize);
    const farAheadChunks = Math.ceil(maxRenderDistance / chunkSize) + 2;
    
    let chunkCount = 0;
    const maxChunks = 80; // Increased for smooth transitions
    
    // Generate chunks with fog-based opacity only ahead of the player
    for (let x = playerChunkX - chunkRadius; x <= playerChunkX + chunkRadius && chunkCount < maxChunks; x++) {
      for (let z = playerChunkZ; z <= playerChunkZ + farAheadChunks && chunkCount < maxChunks; z++) {
        const worldX = x * chunkSize;
        const worldZ = -z * chunkSize;
        
        const distanceToPlayer = Math.sqrt(
          Math.pow(worldX - roundedPlayerX, 2) + 
          Math.pow(worldZ - roundedPlayerZ, 2)
        );
        
        if (distanceToPlayer <= maxRenderDistance) {
          const seed = ((x & 0xFFFF) << 16) | (z & 0xFFFF);
          
          // Calculate fog-based opacity for smooth transitions
          let fogOpacity = 1.0;
          let isVisible = true;
          
          if (distanceToPlayer > fogStartDistance) {
            const fogProgress = (distanceToPlayer - fogStartDistance) / (fogEndDistance - fogStartDistance);
            fogOpacity = Math.max(0, 1 - Math.pow(fogProgress, 2)); // Exponential falloff
            isVisible = fogOpacity > 0.1; // Only render if sufficiently visible
          }
          
          if (isVisible) {
            chunks.push({
              id: `fog_chunk_${x}_${z}`,
              x,
              z,
              worldX,
              worldZ,
              seed: Math.abs(seed) % 10000,
              distanceToPlayer,
              fogOpacity,
              isVisible
            });
            
            chunkCount++;
          }
        }
      }
    }
    
    console.log(`FogBasedChunkSystem: Generated ${chunks.length} fog-aware chunks`);
    return chunks;
  }, [
    Math.floor(playerPosition.x / 20) * 20, // More responsive than before
    Math.floor(Math.abs(playerPosition.z) / 20) * 20,
    chunkSize,
    renderDistance,
    fogNear,
    fogFar
  ]);

  return <>{children(activeChunks, fogFar)}</>;
});

FogBasedChunkSystem.displayName = 'FogBasedChunkSystem';
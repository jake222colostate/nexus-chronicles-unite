import React, { useMemo } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';
import { InstancedGLBSystem } from './InstancedGLBSystem';
import { FrustumCullingSystem } from './FrustumCullingSystem';
import { assetUrl } from '@/lib/utils';

interface OptimizedGLBTreeSystemProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

// Seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Terrain height calculation for proper tree placement
const getTerrainHeight = (x: number, z: number): number => {
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5 + 
                     Math.sin(x * 0.005) * Math.cos(z * 0.005) * 1.0;
  const jitter = (Math.sin(x * 0.1) * Math.cos(z * 0.1)) * 0.1;
  return Math.max(0, baseHeight + jitter);
};

// Check if position is valid for tree placement
const isValidTreePosition = (x: number, z: number): boolean => {
  const pathWidth = 10;
  const notInPlayerPath = Math.abs(x) >= pathWidth;
  const inValidXRange = Math.abs(x) >= 4 && Math.abs(x) <= 150;
  const notTooCloseToPlayer = Math.sqrt(x * x + (z + 10) * (z + 10)) > 6;
  
  return notInPlayerPath && inValidXRange && notTooCloseToPlayer;
};

export const OptimizedGLBTreeSystem: React.FC<OptimizedGLBTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Generate tree positions with different GLB models
  const { ancientTreePositions, ancientTree2Positions } = useMemo(() => {
    if (realm !== 'fantasy') {
      return { ancientTreePositions: [], ancientTree2Positions: [] };
    }

    const ancientTrees = [];
    const ancientTree2s = [];
    const minDistance = 8;
    const maxAttempts = 15;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      const treeCount = 2 + Math.floor(seededRandom(seed + 99) * 2); // 2-4 trees per chunk
      const allPositions = [];
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157 + chunk.x * 1000 + chunk.z * 100;

          x = (seededRandom(treeSeed) - 0.5) * 300;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          if (!isValidTreePosition(x, z)) {
            attempts++;
            continue;
          }
          
          terrainHeight = getTerrainHeight(x, z);
          scale = 0.8 + seededRandom(treeSeed + 3) * 0.4; // 0.8-1.2 scale
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          validPosition = allPositions.every(pos => {
            const distance = Math.sqrt(
              Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2)
            );
            return distance >= minDistance;
          });
          
          attempts++;
        }
        
        if (validPosition) {
          const finalY = terrainHeight - 1.8;
          const position = { 
            position: [x, finalY, z] as [number, number, number], 
            scale, 
            rotation: [0, rotation, 0] as [number, number, number] 
          };
          allPositions.push({ x, y: finalY, z });
          
          // Distribute between two tree types
          if (seededRandom(seed + i * 13) < 0.6) {
            ancientTrees.push(position);
          } else {
            ancientTree2s.push(position);
          }
        }
      }
    });
    
    return { 
      ancientTreePositions: ancientTrees, 
      ancientTree2Positions: ancientTree2s 
    };
  }, [chunks.map(c => `${c.id}-${c.x}-${c.z}`).join(','), chunkSize, realm]);

  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <FrustumCullingSystem cullDistance={150}>
      {/* AncientTree.glb instances */}
      {ancientTreePositions.length > 0 && (
        <InstancedGLBSystem
          modelUrl={assetUrl('assets/environment/AncientTree.glb')}
          positions={ancientTreePositions}
          maxCount={500}
          frustumCull={true}
        />
      )}
      
      {/* AncientTree2.glb instances */}
      {ancientTree2Positions.length > 0 && (
        <InstancedGLBSystem
          modelUrl={assetUrl('assets/environment/AncientTree2.glb')}
          positions={ancientTree2Positions}
          maxCount={300}
          frustumCull={true}
        />
      )}
    </FrustumCullingSystem>
  );
};
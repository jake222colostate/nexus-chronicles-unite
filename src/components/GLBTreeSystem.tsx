
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface GLBTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm?: 'fantasy' | 'scifi';
  mountainBounds?: {
    centerBuffer: number;
  };
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Updated for central valley: trees cannot spawn in the valley corridor
const isValidTreePosition = (x: number, z: number, mountainBounds?: { centerBuffer: number }): boolean => {
  const buffer = mountainBounds?.centerBuffer || 8; // Wider buffer for valley
  
  // Check if tree is too close to the central valley path
  const inValleyCorridor = Math.abs(x) < buffer;
  
  // Also avoid spawning too close to mountain sides (|x| > 15 means on steep terrain)
  const onSteepTerrain = Math.abs(x) > 15;
  
  return !inValleyCorridor && !onSteepTerrain;
};

export const GLBTreeSystem: React.FC<GLBTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm = 'fantasy',
  mountainBounds
}) => {
  // Only render trees for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  let scene = null;
  try {
    const gltf = useGLTF('https://github.com/jake222colostate/UpdatedModels/raw/main/pine218_draco.glb');
    scene = gltf.scene;
  } catch (error) {
    console.warn('Failed to load tree model:', error);
  }

  const treeInstances = useMemo(() => {
    if (!scene) return [];
    
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Generate fewer trees but with better collision detection for valley terrain
      const treeCount = 8 + Math.floor(seededRandom(seed + 100) * 6); // 8-14 trees per chunk
      let successfulPlacements = 0;
      let attempts = 0;
      const maxAttempts = 40;
      const placedPositions: Array<{x: number, z: number}> = [];
      
      // Updated mountain bounds for central valley
      const effectiveMountainBounds = mountainBounds || {
        centerBuffer: 8 // Wider buffer for the valley corridor
      };
      
      while (successfulPlacements < treeCount && attempts < maxAttempts) {
        const treeSeed = seed + attempts * 67;
        
        // Generate position avoiding the central valley area
        const x = (seededRandom(treeSeed) - 0.5) * 30; // Spread across wider area
        const z = worldZ - (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        
        // Check if position is valid (not in valley corridor or on steep terrain)
        if (isValidTreePosition(x, z, effectiveMountainBounds)) {
          // Check minimum distance from other trees
          const tooCloseToOthers = placedPositions.some(pos => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            return distance < 6; // Minimum 6 units between trees
          });
          
          if (!tooCloseToOthers) {
            const rotationY = seededRandom(treeSeed + 2) * Math.PI * 2;
            const scale = 0.6 + seededRandom(treeSeed + 3) * 0.8; // 0.6 to 1.4 scale
            
            // Adjust Y position based on distance from valley center
            const distanceFromCenter = Math.abs(x);
            const baseY = 0;
            const terrainY = distanceFromCenter > 10 ? baseY + (distanceFromCenter - 10) * 0.3 : baseY;
            const randomY = seededRandom(treeSeed + 4) * 1.2;
            
            instances.push({
              key: `tree_${chunk.id}_${attempts}`,
              position: [x, terrainY + randomY, z] as [number, number, number],
              rotation: [0, rotationY, 0] as [number, number, number],
              scale: [scale, scale, scale] as [number, number, number]
            });
            
            placedPositions.push({x, z});
            successfulPlacements++;
          }
        }
        
        attempts++;
      }
    });
    
    console.log(`GLBTreeSystem: Generated ${instances.length} trees avoiding central valley (|x| >= 8)`);
    
    return instances;
  }, [chunks, chunkSize, scene, mountainBounds]);

  if (!scene || treeInstances.length === 0) {
    return null;
  }

  return (
    <group>
      {treeInstances.map((instance) => {
        const clonedScene = scene.clone();
        
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Optimize for mobile performance
            if (child.material) {
              child.material.needsUpdate = false;
            }
          }
        });
        
        return (
          <primitive
            key={instance.key}
            object={clonedScene}
            position={instance.position}
            rotation={instance.rotation}
            scale={instance.scale}
          />
        );
      })}
    </group>
  );
};

// Preload the tree model
useGLTF.preload('https://github.com/jake222colostate/UpdatedModels/raw/main/pine218_draco.glb');

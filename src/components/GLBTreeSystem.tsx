
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

// Updated for single mountain with natural valley: trees spawn on mountain slopes, not in valley center
const isValidTreePosition = (x: number, z: number, mountainBounds?: { centerBuffer: number }): boolean => {
  const buffer = mountainBounds?.centerBuffer || 4; // Natural valley center buffer
  
  // Trees should avoid the natural valley center (player path area)
  const inValleyCenter = Math.abs(x) < buffer;
  
  // Trees can be on mountain slopes (outside the natural valley)
  const onMountainSlopes = Math.abs(x) >= buffer && Math.abs(x) <= 20;
  
  // Avoid extreme positions that would be outside the mountain entirely
  const outsideMountain = Math.abs(x) > 25;
  
  return !inValleyCenter && onMountainSlopes && !outsideMountain;
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
      
      // Generate trees positioned on the single mountain's slopes
      const treeCount = 4 + Math.floor(seededRandom(seed + 100) * 3); // 4-7 trees per chunk
      let successfulPlacements = 0;
      let attempts = 0;
      const maxAttempts = 25;
      const placedPositions: Array<{x: number, z: number}> = [];
      
      // Updated bounds for single mountain with natural valley
      const effectiveMountainBounds = mountainBounds || {
        centerBuffer: 4 // Keep valley center clear for player movement
      };
      
      while (successfulPlacements < treeCount && attempts < maxAttempts) {
        const treeSeed = seed + attempts * 67;
        
        // Generate position on mountain slopes (not in natural valley center)
        const x = (seededRandom(treeSeed) - 0.5) * 40; // Spread across mountain width
        const z = worldZ - (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        
        // Check if position is valid for mountain slope placement
        if (isValidTreePosition(x, z, effectiveMountainBounds)) {
          // Check minimum distance from other trees
          const tooCloseToOthers = placedPositions.some(pos => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            return distance < 6; // Minimum 6 units between trees
          });
          
          if (!tooCloseToOthers) {
            const rotationY = seededRandom(treeSeed + 2) * Math.PI * 2;
            const scale = 0.8 + seededRandom(treeSeed + 3) * 0.5; // 0.8 to 1.3 scale
            
            // Position trees on mountain slopes with natural height variation
            const distanceFromCenter = Math.abs(x);
            const slopeHeight = distanceFromCenter > 6 ? (distanceFromCenter - 6) * 0.15 : 0;
            const randomY = seededRandom(treeSeed + 4) * 0.6;
            
            instances.push({
              key: `tree_${chunk.id}_${attempts}`,
              position: [x, slopeHeight + randomY - 0.5, z] as [number, number, number],
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
    
    console.log(`GLBTreeSystem: Generated ${instances.length} trees on single mountain slopes (avoiding valley center |x| < 4)`);
    
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

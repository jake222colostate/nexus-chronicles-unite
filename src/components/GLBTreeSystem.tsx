
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface GLBTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm?: 'fantasy' | 'scifi';
  mountainBounds?: {
    leftX: number;
    rightX: number;
    buffer: number;
  };
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Check if tree position conflicts with mountain bounds
const isValidTreePosition = (x: number, mountainBounds?: { leftX: number; rightX: number; buffer: number }): boolean => {
  if (!mountainBounds) return Math.abs(x) < 12; // Default path checking
  
  const { leftX, rightX, buffer } = mountainBounds;
  
  // Check if tree is too close to mountains (with buffer)
  const tooCloseToLeftMountain = x > (leftX - buffer) && x < (leftX + buffer);
  const tooCloseToRightMountain = x > (rightX - buffer) && x < (rightX + buffer);
  
  // Check if tree is on the player path (center area)
  const onPlayerPath = Math.abs(x) < 6;
  
  return !tooCloseToLeftMountain && !tooCloseToRightMountain && !onPlayerPath;
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
      
      // Generate fewer trees but with better collision detection
      const treeCount = 6 + Math.floor(seededRandom(seed + 100) * 4); // 6-10 trees per chunk
      let successfulPlacements = 0;
      let attempts = 0;
      const maxAttempts = 30;
      const placedPositions: Array<{x: number, z: number}> = [];
      
      while (successfulPlacements < treeCount && attempts < maxAttempts) {
        const treeSeed = seed + attempts * 67;
        
        // Generate position with mountain collision avoidance
        const x = (seededRandom(treeSeed) - 0.5) * 40; // Spread across wider area
        const z = worldZ - (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        
        // Check if position is valid (not in mountains or too close to other trees)
        if (isValidTreePosition(x, mountainBounds)) {
          // Check minimum distance from other trees
          const tooCloseToOthers = placedPositions.some(pos => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            return distance < 8; // Minimum 8 units between trees
          });
          
          if (!tooCloseToOthers) {
            const rotationY = seededRandom(treeSeed + 2) * Math.PI * 2;
            const scale = 0.8 + seededRandom(treeSeed + 3) * 0.6; // 0.8 to 1.4 scale
            const y = seededRandom(treeSeed + 4) * 1.5; // Small height variation
            
            instances.push({
              key: `tree_${chunk.id}_${attempts}`,
              position: [x, y, z] as [number, number, number],
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

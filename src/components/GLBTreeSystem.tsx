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

// UPDATED: Allow trees on mountain slopes and wider valley areas
const isValidTreePosition = (x: number, z: number, mountainBounds?: { centerBuffer: number }): boolean => {
  const buffer = mountainBounds?.centerBuffer || 8;
  
  // Avoid the central path but allow wider mountain side placement
  const inPlayerPath = Math.abs(x) < buffer;
  
  // Trees can be placed on mountain slopes in much wider area
  const inMountainArea = Math.abs(x) >= buffer && Math.abs(x) <= 180; // EXPANDED for mountain sides
  
  return !inPlayerPath && inMountainArea;
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
      
      // INCREASED tree count for mountain side coverage
      const treeCount = 10 + Math.floor(seededRandom(seed + 100) * 6); // 10-15 trees per chunk
      let successfulPlacements = 0;
      let attempts = 0;
      const maxAttempts = 80; // More attempts for better coverage
      const placedPositions: Array<{x: number, z: number}> = [];
      
      // EXPANDED mountain bounds for wider tree placement
      const effectiveMountainBounds = mountainBounds || {
        centerBuffer: 8
      };
      
      while (successfulPlacements < treeCount && attempts < maxAttempts) {
        const treeSeed = seed + attempts * 67;
        
        // EXPANDED: Generate trees across much wider area for mountain sides
        const x = (seededRandom(treeSeed) - 0.5) * 360; // EXPANDED to ±180 for full mountain coverage
        const z = worldZ - (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.9;
        
        // Check if position is valid for mountain slope placement
        if (isValidTreePosition(x, z, effectiveMountainBounds)) {
          // Check minimum distance from other trees
          const tooCloseToOthers = placedPositions.some(pos => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            return distance < 6; // Reduced spacing for denser coverage
          });
          
          if (!tooCloseToOthers) {
            const rotationY = seededRandom(treeSeed + 2) * Math.PI * 2;
            const scale = 0.6 + seededRandom(treeSeed + 3) * 0.6; // 0.6 to 1.2 scale
            
            // UPDATED: Better height calculation for mountain slopes
            const distanceFromCenter = Math.abs(x);
            let slopeHeight = 0;
            
            if (distanceFromCenter > 15) {
              slopeHeight = (distanceFromCenter - 15) * 0.1; // Gradual mountain slope
            }
            
            const randomY = seededRandom(treeSeed + 4) * 1.0;
            
            instances.push({
              key: `tree_${chunk.id}_${attempts}`,
              position: [x, slopeHeight + randomY - 2, z] as [number, number, number],
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
    
    console.log(`GLBTreeSystem: Generated ${instances.length} trees across mountain sides and valley`);
    
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

export default GLBTreeSystem;

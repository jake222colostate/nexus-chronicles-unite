
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

// Updated for centered mountain with natural valley: trees spawn on mountain slopes avoiding center valley
const isValidTreePosition = (x: number, z: number, mountainBounds?: { centerBuffer: number }): boolean => {
  const buffer = mountainBounds?.centerBuffer || 10; // Larger buffer for natural valley center
  
  // Avoid the central valley area where player moves
  const inNaturalValleyCenter = Math.abs(x) < buffer && Math.abs(z) < buffer;
  
  // Trees can be on the mountain slopes outside the valley center
  const onMountainSlopes = Math.sqrt(x * x + z * z) >= buffer && Math.sqrt(x * x + z * z) <= 35;
  
  return !inNaturalValleyCenter && onMountainSlopes;
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
      
      // Generate trees positioned around the centered mountain's natural valley
      const treeCount = 4 + Math.floor(seededRandom(seed + 100) * 3); // 4-6 trees per chunk
      let successfulPlacements = 0;
      let attempts = 0;
      const maxAttempts = 40;
      const placedPositions: Array<{x: number, z: number}> = [];
      
      // Natural valley bounds for centered mountain
      const effectiveMountainBounds = mountainBounds || {
        centerBuffer: 10 // Keep natural valley center clear for player
      };
      
      while (successfulPlacements < treeCount && attempts < maxAttempts) {
        const treeSeed = seed + attempts * 67;
        
        // Generate position around mountain slopes (outside natural valley center)
        const x = (seededRandom(treeSeed) - 0.5) * 70; // Wider spread for centered mountain
        const z = worldZ - (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        
        // Check if position is valid for mountain slope placement around valley
        if (isValidTreePosition(x, z, effectiveMountainBounds)) {
          // Check minimum distance from other trees
          const tooCloseToOthers = placedPositions.some(pos => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            return distance < 10; // Increased spacing for centered mountain
          });
          
          if (!tooCloseToOthers) {
            const rotationY = seededRandom(treeSeed + 2) * Math.PI * 2;
            const scale = 0.8 + seededRandom(treeSeed + 3) * 0.4; // 0.8 to 1.2 scale
            
            // Position trees on mountain slopes with natural height variation
            const distanceFromCenter = Math.sqrt(x * x + z * z);
            const slopeHeight = distanceFromCenter > 10 ? (distanceFromCenter - 10) * 0.15 : 0;
            const randomY = seededRandom(treeSeed + 4) * 1.0;
            
            instances.push({
              key: `tree_${chunk.id}_${attempts}`,
              position: [x, slopeHeight + randomY - 3, z] as [number, number, number],
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
    
    console.log(`GLBTreeSystem: Generated ${instances.length} trees around centered mountain valley (avoiding center)`);
    
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


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

// Updated for closer mountain positioning: smaller buffer for more intimate valley
const isValidTreePosition = (x: number, z: number, mountainBounds?: { centerBuffer: number }): boolean => {
  const buffer = mountainBounds?.centerBuffer || 6; // Reduced buffer for closer mountain
  
  // Avoid the central valley area where player moves (smaller area now)
  const inNaturalValleyCenter = Math.abs(x) < buffer && Math.abs(z) < buffer;
  
  // Trees can be on the mountain slopes outside the smaller valley center
  const onMountainSlopes = Math.sqrt(x * x + z * z) >= buffer && Math.sqrt(x * x + z * z) <= 40;
  
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
      
      // Generate trees positioned around the closer mountain's valley
      const treeCount = 4 + Math.floor(seededRandom(seed + 100) * 3); // 4-6 trees per chunk
      let successfulPlacements = 0;
      let attempts = 0;
      const maxAttempts = 40;
      const placedPositions: Array<{x: number, z: number}> = [];
      
      // Smaller valley bounds for closer mountain
      const effectiveMountainBounds = mountainBounds || {
        centerBuffer: 6 // Smaller buffer for closer mountain positioning
      };
      
      while (successfulPlacements < treeCount && attempts < maxAttempts) {
        const treeSeed = seed + attempts * 67;
        
        // Generate position around closer mountain slopes
        const x = (seededRandom(treeSeed) - 0.5) * 80; // Slightly wider spread
        const z = worldZ - (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        
        // Check if position is valid for closer mountain slope placement
        if (isValidTreePosition(x, z, effectiveMountainBounds)) {
          // Check minimum distance from other trees
          const tooCloseToOthers = placedPositions.some(pos => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            return distance < 8; // Slightly reduced spacing for closer mountain
          });
          
          if (!tooCloseToOthers) {
            const rotationY = seededRandom(treeSeed + 2) * Math.PI * 2;
            const scale = 0.8 + seededRandom(treeSeed + 3) * 0.4; // 0.8 to 1.2 scale
            
            // Position trees on closer mountain slopes with adjusted height
            const distanceFromCenter = Math.sqrt(x * x + z * z);
            const slopeHeight = distanceFromCenter > 6 ? (distanceFromCenter - 6) * 0.18 : 0;
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
    
    console.log(`GLBTreeSystem: Generated ${instances.length} trees around closer mountain valley`);
    
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

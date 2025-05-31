
import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { ChunkData } from './ChunkSystem';

interface GLBTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const TREE_MODEL_URL = 'https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_tree.glb';

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Individual tree component with proper GLB handling
const GLBTree: React.FC<{ position: [number, number, number]; scale: number; rotation: number }> = ({
  position,
  scale,
  rotation
}) => {
  const { scene, error } = useGLTF(TREE_MODEL_URL);
  
  console.log('GLB Tree render - Scene:', scene, 'Error:', error, 'Position:', position);
  
  if (error) {
    console.error('Failed to load tree model:', error);
    return null;
  }
  
  if (!scene) {
    console.warn('Tree scene not loaded yet');
    return null;
  }

  // Clone the scene to avoid sharing geometry between instances
  const clonedScene = scene.clone();
  
  return (
    <group
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, rotation, 0]}
    >
      <primitive 
        object={clonedScene} 
        castShadow 
        receiveShadow 
      />
    </group>
  );
};

export const GLBTreeSystem: React.FC<GLBTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const groupRef = useRef();

  console.log('GLBTreeSystem render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('GLBTreeSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate tree positions for each chunk
  const treePositions = useMemo(() => {
    console.log('Generating tree positions for', chunks.length, 'chunks');
    const positions = [];
    const minDistance = 5; // Reduced for better coverage
    const maxAttempts = 30;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 2-4 trees per chunk for better density
      const treeCount = 2 + Math.floor(seededRandom(seed) * 3);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 67;
          
          // Spread trees more broadly across the chunk
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.8;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          // Varied scale and rotation for natural look
          scale = 0.5 + seededRandom(treeSeed + 2) * 0.8; // Smaller scale range
          rotation = seededRandom(treeSeed + 3) * Math.PI * 2;
          
          // Check distance from existing trees
          validPosition = true;
          for (const existing of positions) {
            const distance = Math.sqrt(
              Math.pow(x - existing.x, 2) + Math.pow(z - existing.z, 2)
            );
            if (distance < minDistance) {
              validPosition = false;
              break;
            }
          }
          
          attempts++;
        }
        
        if (validPosition) {
          positions.push({ x, z, scale, rotation, chunkId: chunk.id });
          console.log(`Tree ${i} placed at (${x.toFixed(2)}, ${z.toFixed(2)}) with scale ${scale.toFixed(2)}`);
        } else {
          console.warn(`Failed to place tree ${i} in chunk ${chunk.id} after ${maxAttempts} attempts`);
        }
      }
    });
    
    console.log(`Total trees generated: ${positions.length}`);
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        {treePositions.map((pos, index) => {
          console.log(`Rendering tree ${index} at position:`, [pos.x, 0, pos.z]);
          return (
            <GLBTree
              key={`glb-tree-${pos.chunkId}-${index}`}
              position={[pos.x, 0, pos.z]} // Changed Y to 0 instead of -1
              scale={pos.scale}
              rotation={pos.rotation}
            />
          );
        })}
      </Suspense>
    </group>
  );
};

// Preload the model for better performance
console.log('Preloading GLB tree model:', TREE_MODEL_URL);
useGLTF.preload(TREE_MODEL_URL);

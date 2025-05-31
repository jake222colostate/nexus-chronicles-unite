
import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { ChunkData } from './ChunkSystem';

interface GLBTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const TREE_MODEL_URL = 'https://github.com/jake222colostate/enviornment/raw/main/fantasy_tree.glb';

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const GLBTreeSystem: React.FC<GLBTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const groupRef = useRef();

  // Only load the model for fantasy realm
  const { scene: treeModel, error } = useGLTF(TREE_MODEL_URL, true);

  // Log errors but don't crash
  React.useEffect(() => {
    if (error) {
      console.error('Failed to load GLB tree model:', error);
    }
  }, [error]);

  // Generate tree positions for each chunk
  const treePositions = useMemo(() => {
    if (realm !== 'fantasy' || !treeModel || error) {
      return [];
    }

    const positions = [];
    const minDistance = 8;
    const maxAttempts = 50;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 3-5 trees per chunk for natural forest density
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 67;
          
          // Position trees on either side of the road (avoiding center path)
          const side = seededRandom(treeSeed) > 0.5 ? 1 : -1;
          x = worldX + side * (15 + seededRandom(treeSeed + 1) * 25); // Stay away from road
          z = worldZ - seededRandom(treeSeed + 2) * chunkSize;
          
          // Varied scale and rotation for natural look
          scale = 0.8 + seededRandom(treeSeed + 3) * 0.6;
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
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
          positions.push({ x, z: z, scale, rotation, chunkId: chunk.id });
        }
      }
    });
    
    return positions;
  }, [chunks, chunkSize, realm, treeModel, error]);

  // Don't render if not fantasy realm, no model, or error
  if (realm !== 'fantasy' || !treeModel || error) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {treePositions.map((pos, index) => (
        <group
          key={`glb-tree-${pos.chunkId}-${index}`}
          position={[pos.x, -1, pos.z]}
          scale={[pos.scale, pos.scale, pos.scale]}
          rotation={[0, pos.rotation, 0]}
        >
          <primitive object={treeModel.clone()} castShadow receiveShadow />
        </group>
      ))}
    </group>
  );
};

// Preload the model
useGLTF.preload(TREE_MODEL_URL);

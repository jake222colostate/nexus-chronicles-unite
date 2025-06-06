
import React, { useMemo, useRef, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ChunkData } from './ChunkSystem';

interface GLBTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Local GLB tree models bundled with the project
const TREE_MODELS = {
  stylized: '/stylized_tree.glb',
  pine218: '/pine_tree_218poly.glb',
  pineLow: '/lowpoly_pine_tree.glb'
} as const;

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Terrain height simulation function - always returns a number
const getTerrainHeight = (x: number, z: number): number => {
  return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2 + 
         Math.sin(x * 0.005) * Math.cos(z * 0.005) * 3;
};

// Check if position is on player path
const isOnPlayerPath = (x: number, z: number): boolean => {
  return Math.abs(x) < 3; // 3 unit buffer around path center
};

// Fallback tree component using basic geometry
const FallbackTree: React.FC<{ position: [number, number, number]; scale: number; rotation: number }> = ({
  position,
  scale,
  rotation
}) => {
  return (
    <group
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, rotation, 0]}
    >
      {/* Tree trunk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.15, 1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Tree foliage */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.8, 1.5, 8]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshLambertMaterial color="#32CD32" />
      </mesh>
    </group>
  );
};

// Individual tree component with proper GLB handling and fallback
const GLBTree: React.FC<{
  modelUrl: string;
  position: [number, number, number];
  scale: number;
  rotation: number;
}> = ({ modelUrl, position, scale, rotation }) => {
  try {
    const { scene } = useGLTF(modelUrl);

    if (!scene) {
      console.warn('Tree scene not loaded, using fallback');
      return <FallbackTree position={position} scale={scale} rotation={rotation} />;
    }

    // Clone the scene so each instance can be transformed independently
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // Ensure shadows work for all meshes
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) child.material.needsUpdate = true;
      }
    });

    return (
      <group position={position} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    console.error('Failed to load GLB tree model, using fallback:', error);
    return <FallbackTree position={position} scale={scale} rotation={rotation} />;
  }
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
    const positions: Array<{
      x: number;
      z: number;
      y: number;
      scale: number;
      rotation: number;
      modelUrl: string;
      chunkId: number;
    }> = [];
    const minDistance = 8; // Increased distance to spread trees out more
    const maxAttempts = 20;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate fewer trees per chunk to avoid overcrowding
      const treeCount = 1 + Math.floor(seededRandom(seed) * 2); // 1-2 trees per chunk
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x: number, z: number, y: number, scale: number, rotation: number, modelUrl: string;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 67;
          
          // Place trees further from the path center
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.6;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.6;
          
          // Skip if on player path
          if (isOnPlayerPath(x, z)) {
            attempts++;
            continue;
          }
          
          // Calculate terrain height for proper placement - ensure it's a number
          y = Number(getTerrainHeight(x, z));
          
          // Randomly select a tree model
          const modelKeys = Object.keys(TREE_MODELS) as Array<keyof typeof TREE_MODELS>;
          const modelIndex = Math.floor(seededRandom(treeSeed + 2) * modelKeys.length);
          const treeKey = modelKeys[modelIndex];
          modelUrl = TREE_MODELS[treeKey];

          // Much smaller scale for trees - they should be decorative elements
          const baseScale = 0.3; // Reduced from 0.8-0.9 to 0.3
          const variation = 0.8 + seededRandom(treeSeed + 3) * 0.4; // 0.8-1.2 variation
          scale = baseScale * variation;
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
        
        if (validPosition && x !== undefined && z !== undefined && y !== undefined && scale !== undefined && rotation !== undefined && modelUrl !== undefined) {
          positions.push({ x, z, y, scale, rotation, modelUrl, chunkId: seed });
          console.log(`Tree ${i} placed at (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) with scale ${scale.toFixed(2)}`);
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
        {treePositions.map((pos, index) => (
          <GLBTree
            key={`glb-tree-${pos.chunkId}-${index}`}
            modelUrl={pos.modelUrl}
            position={[pos.x, pos.y, pos.z]}
            scale={pos.scale}
            rotation={pos.rotation}
          />
        ))}
      </Suspense>
    </group>
  );
};

// Preload the model for better performance, but handle errors gracefully
console.log('Attempting to preload GLB tree models...');
Object.values(TREE_MODELS).forEach((url) => {
  try {
    useGLTF.preload(url);
    console.log('Preloaded tree model:', url);
  } catch (error) {
    console.warn('Failed to preload GLB model:', url, error);
  }
});

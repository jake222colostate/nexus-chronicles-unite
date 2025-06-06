
import React, { useMemo, useRef, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ChunkData } from './ChunkSystem';

interface GLBTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Updated tree models with proper pine_tree_218poly path
const TREE_MODELS = {
  stylized: '/stylized_tree.glb',
  pine218: '/assets/pine_tree_218poly.glb', // Corrected path to assets folder
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
      {/* Pine tree foliage - multiple cone layers */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.8, 1.5, 8]} />
        <meshLambertMaterial color="#013220" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshLambertMaterial color="#228B22" />
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
    console.log('GLBTree: Loading model from:', modelUrl);
    const { scene } = useGLTF(modelUrl);

    if (!scene) {
      console.warn('GLBTree: Scene not loaded for', modelUrl, 'using fallback');
      return <FallbackTree position={position} scale={scale} rotation={rotation} />;
    }

    console.log('GLBTree: Successfully loaded', modelUrl);

    // Clone the scene so each instance can be transformed independently
    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      
      // Ensure shadows work for all meshes
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
      
      return clone;
    }, [scene]);

    return (
      <group position={position} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    console.error('GLBTree: Failed to load model', modelUrl, error);
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

  // Generate tree positions for each chunk with focus on pine_tree_218poly
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
      
      // Generate 2-3 trees per chunk, focusing on pine_tree_218poly
      const treeCount = 2 + Math.floor(seededRandom(seed) * 2); // 2-3 trees per chunk
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
          
          // Calculate terrain height for proper placement
          y = Number(getTerrainHeight(x, z));
          
          // Prioritize pine_tree_218poly (70% chance), then others
          const modelRandom = seededRandom(treeSeed + 2);
          if (modelRandom < 0.7) {
            modelUrl = TREE_MODELS.pine218; // 70% pine_tree_218poly
          } else if (modelRandom < 0.85) {
            modelUrl = TREE_MODELS.stylized; // 15% stylized
          } else {
            modelUrl = TREE_MODELS.pineLow; // 15% pineLow
          }

          // Appropriate scale for pine trees
          const baseScale = 0.4; // Good size for pine trees
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
          console.log(`Pine tree ${i} placed at (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) with scale ${scale.toFixed(2)} using model: ${modelUrl}`);
        } else {
          console.warn(`Failed to place tree ${i} in chunk ${chunk.id} after ${maxAttempts} attempts`);
        }
      }
    });
    
    console.log(`Total pine trees generated: ${positions.length}`);
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        {treePositions.map((pos, index) => (
          <GLBTree
            key={`pine-tree-${pos.chunkId}-${index}`}
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

// Preload the pine_tree_218poly model for better performance
console.log('GLBTreeSystem: Preloading pine tree models...');
Object.values(TREE_MODELS).forEach((url) => {
  try {
    useGLTF.preload(url);
    console.log('GLBTreeSystem: Preloaded tree model:', url);
  } catch (error) {
    console.warn('GLBTreeSystem: Failed to preload model:', url, error);
  }
});

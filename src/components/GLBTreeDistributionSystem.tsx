
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// GLB Tree model URLs - using the actual .glb files from your repository
const TREE_MODELS = {
  pine: '/lowpoly_pine_tree.glb',
  stylizedA: '/stylized_tree.glb',
  stylizedB: '/stylized_tree.glb'
};

interface GLBTreeDistributionSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Individual tree component with GLB loading only - no fallbacks
const GLBTreeInstance: React.FC<{
  modelUrl: string;
  treeType: 'pine' | 'stylizedA' | 'stylizedB';
  position: [number, number, number];
  scale: number;
  rotation: number;
}> = ({ modelUrl, treeType, position, scale, rotation }) => {
  try {
    const { scene } = useGLTF(modelUrl);
    
    if (!scene) {
      console.warn(`GLB tree model not loaded for ${treeType}`);
      return null;
    }

    // Clone the scene to create unique instances
    const clonedScene = useMemo(() => {
      const sceneClone = scene.clone();
      
      // Ensure all meshes have proper materials and shadows
      sceneClone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.visible = true;
          child.frustumCulled = false;
          
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1.0;
              child.material.side = THREE.DoubleSide;
              child.material.needsUpdate = true;
            }
          }
        }
      });
      return sceneClone;
    }, [scene]);
    
    return (
      <group position={position} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
    );
  } catch (error) {
    console.error(`Failed to load GLB tree model for ${treeType}:`, error);
    return null;
  }
};

// Terrain height simulation function
const getTerrainHeight = (x: number, z: number): number => {
  return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 1.5 + 
         Math.sin(x * 0.005) * Math.cos(z * 0.005) * 2.5;
};

// Check if position is on a steep slope (>45°)
const isOnSteepSlope = (x: number, z: number): boolean => {
  const sampleDistance = 1.5;
  const centerHeight = getTerrainHeight(x, z);
  const northHeight = getTerrainHeight(x, z - sampleDistance);
  const southHeight = getTerrainHeight(x, z + sampleDistance);
  const eastHeight = getTerrainHeight(x + sampleDistance, z);
  const westHeight = getTerrainHeight(x - sampleDistance, z);
  
  const maxSlope = Math.max(
    Math.abs(centerHeight - northHeight),
    Math.abs(centerHeight - southHeight),
    Math.abs(centerHeight - eastHeight),
    Math.abs(centerHeight - westHeight)
  ) / sampleDistance;
  
  return maxSlope > 0.8;
};

// Check if position is too close to player path
const isOnPlayerPath = (x: number, z: number): boolean => {
  return Math.abs(x) < 4;
};

// Check if position conflicts with mountain areas
const isInMountainArea = (x: number, z: number): boolean => {
  return Math.abs(x) > 15;
};

// Determine tree type based on distribution percentages
const getTreeTypeByDistribution = (seed: number): 'pine' | 'stylizedA' | 'stylizedB' => {
  const random = seededRandom(seed);
  
  if (random < 0.4) {
    return 'pine'; // 40%
  } else if (random < 0.7) {
    return 'stylizedA'; // 30%
  } else {
    return 'stylizedB'; // 30%
  }
};

export const GLBTreeDistributionSystem: React.FC<GLBTreeDistributionSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('GLBTreeDistributionSystem render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('GLBTreeDistributionSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate tree positions with careful placement to avoid mountains
  const treePositions = useMemo(() => {
    console.log('Generating distributed tree positions for', chunks.length, 'chunks');
    const positions = [];
    const minDistance = 4;
    const maxAttempts = 20;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 2-4 trees per chunk
      const treeCount = 2 + Math.floor(seededRandom(seed) * 3);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 123;
          
          // More constrained positioning to avoid mountains
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.5;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.5;
          
          terrainHeight = getTerrainHeight(x, z);
          
          // Skip if on player path, steep slope, or in mountain area
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z) || isInMountainArea(x, z)) {
            attempts++;
            continue;
          }
          
          // Determine tree type based on distribution percentages
          treeType = getTreeTypeByDistribution(treeSeed + 2);
          
          // Scale trees appropriately
          scale = 0.2 + seededRandom(treeSeed + 3) * 0.15; // 0.2 to 0.35 scale
          
          // Y-axis random rotation (0°–360°)
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Check minimum distance from existing trees
          validPosition = positions.every(pos => {
            const distance = Math.sqrt(
              Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2)
            );
            return distance >= minDistance;
          });
          
          attempts++;
        }
        
        if (validPosition) {
          positions.push({ 
            x, 
            z: z, 
            y: terrainHeight, 
            scale, 
            rotation, 
            treeType, 
            chunkId: chunk.id 
          });
          console.log(`${treeType} tree placed at (${x.toFixed(2)}, ${terrainHeight.toFixed(2)}, ${z.toFixed(2)}) with scale ${scale.toFixed(2)}`);
        }
      }
    });
    
    // Log distribution statistics
    const pineCount = positions.filter(p => p.treeType === 'pine').length;
    const stylizedACount = positions.filter(p => p.treeType === 'stylizedA').length;
    const stylizedBCount = positions.filter(p => p.treeType === 'stylizedB').length;
    const total = positions.length;
    
    console.log(`Total distributed trees generated: ${total}`);
    console.log(`Pine trees: ${pineCount} (${total > 0 ? ((pineCount/total)*100).toFixed(1) : 0}%)`);
    console.log(`Stylized A trees: ${stylizedACount} (${total > 0 ? ((stylizedACount/total)*100).toFixed(1) : 0}%)`);
    console.log(`Stylized B trees: ${stylizedBCount} (${total > 0 ? ((stylizedBCount/total)*100).toFixed(1) : 0}%)`);
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group name="TreeGroup">
      <Suspense fallback={null}>
        {treePositions.map((pos, index) => {
          const modelUrl = TREE_MODELS[pos.treeType];
          console.log(`Rendering ${pos.treeType} tree ${index} at position:`, [pos.x, pos.y, pos.z]);
          return (
            <GLBTreeInstance
              key={`distributed-tree-${pos.chunkId}-${index}`}
              modelUrl={modelUrl}
              treeType={pos.treeType}
              position={[pos.x, pos.y, pos.z]}
              scale={pos.scale}
              rotation={pos.rotation}
            />
          );
        })}
      </Suspense>
    </group>
  );
};

// Preload models for better performance
console.log('Attempting to preload GLB tree models...');
Object.entries(TREE_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded ${type} tree model from:`, url);
  } catch (error) {
    console.warn(`Failed to preload ${type} tree model:`, error);
  }
});

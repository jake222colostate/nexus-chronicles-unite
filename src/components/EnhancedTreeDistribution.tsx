
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// Final tree model URLs
const TREE_MODELS = {
  stylized: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/stylized_tree.glb',
  pine218: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/pine_tree_218poly.glb'
} as const;

interface EnhancedTreeDistributionProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Individual tree component with GLB loading - no fallbacks
const TreeInstance: React.FC<{
  modelUrl: string;
  treeType: 'stylized' | 'pine218';
  position: [number, number, number];
  scale: number;
  rotation: number;
}> = ({ modelUrl, treeType, position, scale, rotation }) => {
  try {
    const { scene } = useGLTF(modelUrl);
    
    if (!scene) {
      console.log(`Tree model not loaded for ${treeType}, skipping placement`);
      return null;
    }

    console.log(`Successfully loaded ${treeType} tree at position:`, position);
    
    // Clone the scene to create unique instances
    const clonedScene = scene.clone();
    
    // Preserve original materials and textures
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Preserve original materials - don't modify
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
    
    return (
      <group position={position} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
        <primitive object={clonedScene} castShadow receiveShadow />
      </group>
    );
  } catch (error) {
    console.log(`Failed to load tree model for ${treeType}, skipping placement:`, error);
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
  
  return maxSlope > 0.8; // Slope threshold for 45 degrees
};

// Check if position is too close to player path
const isOnPlayerPath = (x: number, z: number): boolean => {
  return Math.abs(x) < 4; // 4 unit buffer around path center
};

// Determine tree type based on 50/50 distribution
const getTreeTypeByDistribution = (seed: number): 'stylized' | 'pine218' => {
  const random = seededRandom(seed);
  
  if (random < 0.5) {
    return 'stylized'; // 50%
  } else {
    return 'pine218'; // 50%
  }
};

// Get scale range based on final tree type scaling
const getScaleForTreeType = (treeType: 'stylized' | 'pine218', seed: number): number => {
  const random = seededRandom(seed);
  
  switch (treeType) {
    case 'stylized':
      return 0.9 + random * 0.2; // 0.9 to 1.1
    case 'pine218':
      return 6.0 + random * 1.5; // 6.0 to 7.5
    default:
      return 0.9 + random * 0.2;
  }
};

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('EnhancedTreeDistribution render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('EnhancedTreeDistribution: Not fantasy realm, skipping');
    return null;
  }

  // Generate tree positions with jittered placement and 3m spacing
  const treePositions = useMemo(() => {
    console.log('Generating tree positions for', chunks.length, 'chunks');
    const positions = [];
    const minDistance = 3; // 3 meter minimum spacing
    const maxAttempts = 25;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 3-5 trees per chunk
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157;
          
          // Random jittered placement within chunk bounds
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.8;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          terrainHeight = getTerrainHeight(x, z);
          
          // Skip if on player path or steep slope
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z)) {
            attempts++;
            continue;
          }
          
          // Determine tree type based on 50/50 distribution
          treeType = getTreeTypeByDistribution(treeSeed + 2);
          
          // Get appropriate scale for tree type
          scale = getScaleForTreeType(treeType, treeSeed + 3);
          
          // Random Y-axis rotation (0° to 360°)
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Check 3-meter minimum distance from existing trees
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
            z, 
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
    const stylizedCount = positions.filter(p => p.treeType === 'stylized').length;
    const pine218Count = positions.filter(p => p.treeType === 'pine218').length;
    const total = positions.length;
    
    console.log(`Total trees generated: ${total}`);
    console.log(`Stylized trees: ${stylizedCount} (${total > 0 ? ((stylizedCount/total)*100).toFixed(1) : 0}%)`);
    console.log(`Pine 218 trees: ${pine218Count} (${total > 0 ? ((pine218Count/total)*100).toFixed(1) : 0}%)`);
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group name="TreeGroup">
      <Suspense fallback={null}>
        {treePositions.map((pos, index) => {
          const modelUrl = TREE_MODELS[pos.treeType];
          console.log(`Rendering ${pos.treeType} tree ${index} at position:`, [pos.x, pos.y, pos.z]);
          return (
            <TreeInstance
              key={`tree-${pos.chunkId}-${index}`}
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
console.log('Preloading GLB tree models...');
Object.entries(TREE_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded ${type} tree model from:`, url);
  } catch (error) {
    console.warn(`Failed to preload ${type} tree model:`, error);
  }
});

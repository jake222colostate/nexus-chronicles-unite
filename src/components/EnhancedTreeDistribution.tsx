
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// External GLB tree model URLs from the repository
const TREE_MODELS = {
  pine: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/lowpoly_pine_tree.glb',
  stylizedA: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/stylized_tree.glb',
  stylizedB: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/stylized_tree.glb'
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
  treeType: 'pine' | 'stylizedA' | 'stylizedB';
  position: [number, number, number];
  scale: number;
  rotation: number;
}> = ({ modelUrl, treeType, position, scale, rotation }) => {
  try {
    const { scene } = useGLTF(modelUrl);
    
    if (!scene) {
      console.error(`Tree model not loaded for ${treeType}, skipping placement`);
      return null;
    }

    console.log(`Successfully loaded ${treeType} tree at position:`, position);
    
    // Clone the scene to create unique instances
    const clonedScene = scene.clone();
    
    // Ensure all meshes maintain original materials and textures
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Maintain original materials - don't modify
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
    console.error(`Failed to load tree model for ${treeType}, skipping placement:`, error);
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

// Determine tree type based on distribution percentages: 40% Pine, 30% Stylized A, 30% Stylized B
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

  // Generate tree positions with enhanced distribution rules
  const treePositions = useMemo(() => {
    console.log('Generating enhanced tree positions for', chunks.length, 'chunks');
    const positions = [];
    const minDistance = 3; // 3 meter minimum spacing as requested
    const maxAttempts = 25;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 3-5 trees per chunk for good coverage
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157; // Different multiplier for variety
          
          // Position jittering - random placement within chunk bounds
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.8;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          terrainHeight = getTerrainHeight(x, z);
          
          // Skip if on player path or steep slope
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z)) {
            attempts++;
            continue;
          }
          
          // Determine tree type based on distribution percentages
          treeType = getTreeTypeByDistribution(treeSeed + 2);
          
          // Randomize scale from 0.85× to 1.15× as requested
          scale = 0.85 + seededRandom(treeSeed + 3) * 0.3; // 0.85 to 1.15
          
          // Y-axis random rotation (0° to 360°) as requested
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
    const pineCount = positions.filter(p => p.treeType === 'pine').length;
    const stylizedACount = positions.filter(p => p.treeType === 'stylizedA').length;
    const stylizedBCount = positions.filter(p => p.treeType === 'stylizedB').length;
    const total = positions.length;
    
    console.log(`Total enhanced trees generated: ${total}`);
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
          console.log(`Rendering enhanced ${pos.treeType} tree ${index} at position:`, [pos.x, pos.y, pos.z]);
          return (
            <TreeInstance
              key={`enhanced-tree-${pos.chunkId}-${index}`}
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
console.log('Attempting to preload enhanced GLB tree models...');
Object.entries(TREE_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded enhanced ${type} tree model from:`, url);
  } catch (error) {
    console.warn(`Failed to preload enhanced ${type} tree model, will use fallback:`, error);
  }
});

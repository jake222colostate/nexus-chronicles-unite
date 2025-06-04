
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// GLB Tree model URLs
const TREE_MODELS = {
  pine: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/lowpoly_pine_tree.glb',
  stylizedA: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/stylized_tree.glb',
  stylizedB: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/stylized_tree.glb'
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

// Fallback tree components for when models fail to load
const FallbackPineTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  rotation: number;
}> = ({ position, scale, rotation }) => {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.15, 2]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.8, 1.8, 8]} />
        <meshLambertMaterial color="#013220" />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 1.4, 8]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
    </group>
  );
};

const FallbackStylizedTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  rotation: number;
}> = ({ position, scale, rotation }) => {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.6]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 12, 8]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.9, 10, 6]} />
        <meshLambertMaterial color="#32CD32" />
      </mesh>
    </group>
  );
};

// Individual tree component with GLB loading and fallback
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
      console.warn(`GLB tree model not loaded for ${treeType}, using fallback`);
      return treeType === 'pine' ? 
        <FallbackPineTree position={position} scale={scale} rotation={rotation} /> :
        <FallbackStylizedTree position={position} scale={scale} rotation={rotation} />;
    }

    // Clone the scene to avoid sharing geometry between instances
    const clonedScene = scene.clone();
    
    // Ensure all meshes have proper materials and shadows
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
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
    console.error(`Failed to load GLB tree model for ${treeType}, using fallback:`, error);
    return treeType === 'pine' ? 
      <FallbackPineTree position={position} scale={scale} rotation={rotation} /> :
      <FallbackStylizedTree position={position} scale={scale} rotation={rotation} />;
  }
};

// Terrain height simulation function
const getTerrainHeight = (x: number, z: number): number => {
  // Simple noise-based terrain height calculation
  return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 3 + 
         Math.sin(x * 0.005) * Math.cos(z * 0.005) * 5;
};

// Check if position is on a steep slope
const isOnSteepSlope = (x: number, z: number): boolean => {
  const sampleDistance = 2;
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
  
  return maxSlope > 0.8; // Too steep for trees
};

// Check if position is too close to player path
const isOnPlayerPath = (x: number, z: number): boolean => {
  return Math.abs(x) < 4; // 4 unit buffer around path center
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

  // Generate tree positions with terrain-based distribution
  const treePositions = useMemo(() => {
    console.log('Generating distributed tree positions for', chunks.length, 'chunks');
    const positions = [];
    const minDistance = 4; // Minimum distance between trees
    const maxAttempts = 20;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 4-7 trees per chunk with natural distribution
      const treeCount = 4 + Math.floor(seededRandom(seed) * 4);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 83;
          
          // Position trees across the chunk area (not just near roads)
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.9;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.9;
          
          terrainHeight = getTerrainHeight(x, z);
          
          // Skip if on player path or steep slope
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z)) {
            attempts++;
            continue;
          }
          
          // Determine tree type based on terrain height
          if (terrainHeight > 2) {
            // Elevated/hilly terrain - prefer pine trees
            treeType = seededRandom(treeSeed + 2) < 0.7 ? 'pine' : 
                      (seededRandom(treeSeed + 3) < 0.5 ? 'stylizedA' : 'stylizedB');
          } else {
            // Flat/valley terrain - prefer stylized trees
            treeType = seededRandom(treeSeed + 4) < 0.3 ? 'pine' : 
                      (seededRandom(treeSeed + 5) < 0.5 ? 'stylizedA' : 'stylizedB');
          }
          
          // 10-15% scale variation for realism
          const baseScale = treeType === 'pine' ? 0.8 : 1.0;
          scale = baseScale * (0.85 + seededRandom(treeSeed + 6) * 0.3); // 85% to 115% variation
          
          // Random Y-axis rotation
          rotation = seededRandom(treeSeed + 7) * Math.PI * 2;
          
          // Check distance from existing trees
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
        } else {
          console.warn(`Failed to place tree ${i} in chunk ${chunk.id} after ${maxAttempts} attempts`);
        }
      }
    });
    
    console.log(`Total distributed trees generated: ${positions.length}`);
    console.log(`Pine trees: ${positions.filter(p => p.treeType === 'pine').length}`);
    console.log(`Stylized A trees: ${positions.filter(p => p.treeType === 'stylizedA').length}`);
    console.log(`Stylized B trees: ${positions.filter(p => p.treeType === 'stylizedB').length}`);
    
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

// Preload models for better performance, but handle errors gracefully
console.log('Attempting to preload GLB tree models...');
Object.entries(TREE_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded ${type} tree model from:`, url);
  } catch (error) {
    console.warn(`Failed to preload ${type} tree model, will use fallback:`, error);
  }
});


import React, { useMemo, Suspense } from 'react';
import { ChunkData } from '../components/ChunkSystem';
import * as THREE from 'three';
import { TreeAssetManager, TREE_DISTRIBUTION, TREE_SCALES, TREE_Y_OFFSETS } from './TreeAssetManager';

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

// ENHANCED terrain height simulation function for proper grounding
const getTerrainHeight = (x: number, z: number): number => {
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5 + 
                     Math.sin(x * 0.005) * Math.cos(z * 0.005) * 1.0;
  const jitter = (Math.sin(x * 0.1) * Math.cos(z * 0.1)) * 0.1;
  return Math.max(0, baseHeight + jitter);
};

// ENHANCED: Calculate proper mountain slope height for tree grounding
const getMountainSlopeHeight = (x: number, z: number): number => {
  const distanceFromCenter = Math.abs(x);
  
  // Valley floor (close to path)
  if (distanceFromCenter < 15) {
    return getTerrainHeight(x, z);
  }
  
  // Mountain slope calculation - gradual rise
  const slopeStart = 15;
  const slopeDistance = distanceFromCenter - slopeStart;
  const slopeAngle = 0.15; // Gentle slope
  const baseTerrainHeight = getTerrainHeight(x, z);
  const mountainHeight = slopeDistance * slopeAngle;
  
  // Add some natural variation to the slope
  const variation = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 0.3;
  
  return baseTerrainHeight + mountainHeight + variation;
};

// Check if position is on a steep slope (>45°)
const isOnSteepSlope = (x: number, z: number): boolean => {
  const sampleDistance = 1.5;
  const centerHeight = getMountainSlopeHeight(x, z);
  const northHeight = getMountainSlopeHeight(x, z - sampleDistance);
  const southHeight = getMountainSlopeHeight(x, z + sampleDistance);
  const eastHeight = getMountainSlopeHeight(x + sampleDistance, z);
  const westHeight = getMountainSlopeHeight(x - sampleDistance, z);
  
  const maxSlope = Math.max(
    Math.abs(centerHeight - northHeight),
    Math.abs(centerHeight - southHeight),
    Math.abs(centerHeight - eastHeight),
    Math.abs(centerHeight - westHeight)
  ) / sampleDistance;
  
  return maxSlope > 0.8; // Increased threshold for steeper slopes
};

// Check if position is in the main player path corridor - WIDENED for new path width
const isInPlayerPath = (x: number, z: number): boolean => {
  const pathWidth = 15; // Increased for wider path
  return Math.abs(x) < pathWidth;
};

// Check if position is too close to player starting position
const isTooCloseToPlayerStart = (x: number, z: number): boolean => {
  const distance = Math.sqrt(x * x + (z + 10) * (z + 10));
  return distance < 8; // Slightly increased for wider path
};

// Check if position is within the central valley near the path
const isInMountainBoundary = (x: number, z: number): boolean => {
  const mountainBuffer = 8; // Increased for wider path
  return Math.abs(x) < mountainBuffer;
};

// ENHANCED tree positioning with proper grounding
const isValidTreePosition = (x: number, z: number): boolean => {
  const notInPlayerPath = !isInPlayerPath(x, z);
  const inValidXRange = Math.abs(x) >= 8 && Math.abs(x) <= 150; // Adjusted for wider path
  const notOnSteepSlope = !isOnSteepSlope(x, z);
  const notTooCloseToPlayer = !isTooCloseToPlayerStart(x, z);
  const notInMountainBoundary = !isInMountainBoundary(x, z);
  
  return notInPlayerPath && inValidXRange && notOnSteepSlope && notTooCloseToPlayer && notInMountainBoundary;
};

// Get tree type
const getTreeType = (seed: number): 'realistic' | 'stylized' | 'pine218' => {
  const random = seededRandom(seed);
  if (random < 0.7) return 'pine218';
  if (random < 0.9) return 'stylized';
  return 'realistic';
};

// Get randomized scale based on tree type
const getTreeScale = (treeType: 'realistic' | 'stylized' | 'pine218', seed: number): number => {
  const scaleConfig = TREE_SCALES[treeType];
  const random = seededRandom(seed);
  return scaleConfig.min + (random * (scaleConfig.max - scaleConfig.min));
};

// OPTIMIZED Tree component with better performance
const GLBTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine218';
}> = React.memo(({ position, scale, rotation, treeType }) => {
  const treeModel = useMemo(() => {
    return TreeAssetManager.getCachedModel(treeType);
  }, [treeType]);

  const optimizedModel = useMemo(() => {
    if (!treeModel) return null;

    const model = treeModel.clone();
    
    // OPTIMIZED settings for 60fps
    const applyOptimizationRecursive = (object: THREE.Object3D) => {
      object.frustumCulled = true; // Enable culling for performance
      object.matrixAutoUpdate = false; // Disable auto matrix updates
      
      if (object instanceof THREE.Mesh) {
        // Simplified geometry for performance
        if (object.geometry) {
          object.geometry.computeBoundingBox();
          object.geometry.computeBoundingSphere();
        }
        
        // Optimized materials
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(mat => {
            mat.needsUpdate = false; // Prevent unnecessary updates
          });
        }
        
        object.castShadow = false; // Disable shadows for performance
        object.receiveShadow = false;
      }
      
      // Apply to all children
      object.children.forEach(child => applyOptimizationRecursive(child));
    };

    applyOptimizationRecursive(model);
    model.updateMatrixWorld(true);
    return model;
  }, [treeModel]);

  // ENHANCED: Proper ground connection with mountain slope calculation
  const groundHeight = getMountainSlopeHeight(position[0], position[2]);
  const adjustedY = groundHeight + TREE_Y_OFFSETS[treeType] - 1.8;

  const adjustedPosition: [number, number, number] = [
    position[0],
    adjustedY,
    position[2]
  ];

  if (!optimizedModel) {
    // Simplified fallback for better performance
    return (
      <group 
        position={adjustedPosition} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
        matrixAutoUpdate={false}
      >
        <mesh position={[0, 0.5, 0]} castShadow={false} receiveShadow={false}>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow={false} receiveShadow={false}>
          <coneGeometry args={[0.6, 1.5, 6]} />
          <meshLambertMaterial color={treeType === 'pine218' ? "#013220" : "#228B22"} />
        </mesh>
      </group>
    );
  }

  return (
    <group 
      position={adjustedPosition} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
      matrixAutoUpdate={false}
    >
      <primitive object={optimizedModel} />
    </group>
  );
});

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const treePositions = useMemo(() => {
    if (realm !== 'fantasy') {
      return [];
    }

    console.log('EnhancedTreeDistribution: Generating optimized trees for 60fps');
    const trees = [];
    const minDistance = 4; // Increased for better performance
    const maxAttempts = 40; // Reduced for better performance

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      const treeCount = 6 + Math.floor(seededRandom(seed + 99) * 4); // Reduced tree count for performance
      const allPositions = [];
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157 + chunk.x * 1000 + chunk.z * 100;

          x = (seededRandom(treeSeed) - 0.5) * 280; // Slightly reduced range
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          terrainHeight = getMountainSlopeHeight(x, z);
          
          if (!isValidTreePosition(x, z)) {
            attempts++;
            continue;
          }
          
          // Prefer pine trees on mountain sides
          const distanceFromCenter = Math.abs(x);
          if (distanceFromCenter > 80) {
            treeType = seededRandom(treeSeed + 2) < 0.8 ? 'pine218' : 'stylized';
          } else {
            treeType = getTreeType(treeSeed + 2);
          }
          
          scale = getTreeScale(treeType, treeSeed + 3);
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          finalY = terrainHeight + TREE_Y_OFFSETS[treeType] - 1.8;
          
          validPosition = allPositions.every(pos => {
            const distance = Math.sqrt(
              Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2)
            );
            return distance >= minDistance;
          });
          
          attempts++;
        }
        
        if (validPosition) {
          const position = { x, y: finalY, z, scale, rotation, treeType };
          allPositions.push(position);
          trees.push(position);
        }
      }
    });
    
    console.log(`EnhancedTreeDistribution: Generated ${trees.length} optimized trees`);
    return trees;
  }, [chunks.map(c => `${c.id}-${c.x}-${c.z}`).join(','), chunkSize, realm]);

  if (realm !== 'fantasy' || treePositions.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <group>
        {treePositions.map((tree, index) => (
          <GLBTree
            key={`tree-${index}`}
            position={[tree.x, tree.y, tree.z]}
            scale={tree.scale}
            rotation={tree.rotation}
            treeType={tree.treeType}
          />
        ))}
      </group>
    </Suspense>
  );
};

// Clear cache when component unmounts
export const clearTreeModelCache = () => {
  TreeAssetManager.clearCache();
  console.log('Tree model cache cleared');
};

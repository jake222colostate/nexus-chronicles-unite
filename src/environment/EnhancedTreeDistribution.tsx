
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

// OPTIMIZED terrain height calculation
const getTerrainHeight = (x: number, z: number): number => {
  // Simplified calculation for better performance
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5;
  return Math.max(0, baseHeight);
};

// OPTIMIZED mountain slope calculation
const getMountainSlopeHeight = (x: number, z: number): number => {
  const distanceFromCenter = Math.abs(x);
  
  if (distanceFromCenter < 15) {
    return getTerrainHeight(x, z);
  }
  
  const slopeDistance = distanceFromCenter - 15;
  const mountainHeight = slopeDistance * 0.1; // Reduced complexity
  
  return getTerrainHeight(x, z) + mountainHeight;
};

// PERFORMANCE: Simplified slope check
const isOnSteepSlope = (x: number, z: number): boolean => {
  const distanceFromCenter = Math.abs(x);
  return distanceFromCenter > 100; // Simple distance check
};

// PERFORMANCE: Simplified position checks
const isValidTreePosition = (x: number, z: number): boolean => {
  const notInPlayerPath = Math.abs(x) >= 4;
  const inValidXRange = Math.abs(x) <= 120; // Reduced range for performance
  const notOnSteepSlope = !isOnSteepSlope(x, z);
  
  return notInPlayerPath && inValidXRange && notOnSteepSlope;
};

// PERFORMANCE: Simplified tree type selection
const getTreeType = (seed: number): 'realistic' | 'stylized' | 'pine218' => {
  const random = seededRandom(seed);
  if (random < 0.8) return 'pine218'; // Favor lightest model
  if (random < 0.95) return 'stylized';
  return 'realistic';
};

// PERFORMANCE: Optimized tree component
const GLBTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine218';
}> = ({ position, scale, rotation, treeType }) => {
  const treeModel = useMemo(() => {
    return TreeAssetManager.getCachedModel(treeType);
  }, [treeType]);

  const groundHeight = getMountainSlopeHeight(position[0], position[2]);
  const adjustedY = groundHeight + TREE_Y_OFFSETS[treeType] - 1.8;

  const adjustedPosition: [number, number, number] = [
    position[0],
    adjustedY,
    position[2]
  ];

  // PERFORMANCE: Use lightweight fallback if model not ready
  if (!treeModel) {
    return (
      <group 
        position={adjustedPosition} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
      >
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.6, 6]} />
          <meshBasicMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          {treeType === 'pine218' ? (
            <coneGeometry args={[0.3, 0.8, 6]} />
          ) : (
            <sphereGeometry args={[0.4, 8, 6]} />
          )}
          <meshBasicMaterial color={treeType === 'pine218' ? "#013220" : "#228B22"} />
        </mesh>
      </group>
    );
  }

  return (
    <group 
      position={adjustedPosition} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
    >
      <primitive object={treeModel} />
    </group>
  );
};

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
    const minDistance = 4; // Increased spacing for better performance
    const maxAttempts = 30; // Reduced attempts for faster generation

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      const treeCount = 4 + Math.floor(seededRandom(seed + 99) * 3); // REDUCED tree count
      const allPositions = [];
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157 + chunk.x * 1000 + chunk.z * 100;

          x = (seededRandom(treeSeed) - 0.5) * 200; // Reduced range
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.6;
          
          terrainHeight = getMountainSlopeHeight(x, z);
          
          if (!isValidTreePosition(x, z)) {
            attempts++;
            continue;
          }
          
          treeType = getTreeType(treeSeed + 2);
          const scaleConfig = TREE_SCALES[treeType];
          scale = scaleConfig.min + (seededRandom(treeSeed + 3) * (scaleConfig.max - scaleConfig.min));
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

export const clearTreeModelCache = () => {
  TreeAssetManager.clearCache();
  console.log('Tree model cache cleared');
};

import React, { useMemo, Suspense } from 'react';
import { ChunkData } from './ChunkSystem';
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

// UPDATED terrain height simulation function
const getTerrainHeight = (x: number, z: number): number => {
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5 + 
                     Math.sin(x * 0.005) * Math.cos(z * 0.005) * 1.0;
  const jitter = (Math.sin(x * 0.1) * Math.cos(z * 0.1)) * 0.1;
  return Math.max(0, baseHeight + jitter);
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
  
  return maxSlope > 0.6;
};

// Check if position is in the main player path corridor
const isInPlayerPath = (x: number, z: number): boolean => {
  const pathWidth = 4; // Reduced from 6 to allow trees closer to path
  return Math.abs(x) < pathWidth;
};

// Check if position is too close to player starting position
const isTooCloseToPlayerStart = (x: number, z: number): boolean => {
  const distance = Math.sqrt(x * x + (z + 10) * (z + 10));
  return distance < 6;
};

// UPDATED: Check if position overlaps with mountain boundaries
const isInMountainBoundary = (x: number, z: number): boolean => {
  // Mountains are now at X=±6, so trees should stay outside X=±5 range
  const mountainBuffer = 5;
  return Math.abs(x) >= mountainBuffer;
};

// UPDATED tree positioning with mountain boundary respect
const isValidTreePosition = (x: number, z: number): boolean => {
  const notInPlayerPath = !isInPlayerPath(x, z);
  const inValidXRange = Math.abs(x) >= 4.5 && Math.abs(x) <= 4.8; // Tight range between path and mountains
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

// FIXED Tree component - removed conditional hooks to prevent hook count mismatch
const GLBTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine218';
}> = ({ position, scale, rotation, treeType }) => {
  const [treeModel, setTreeModel] = React.useState<THREE.Object3D | null>(null);

  // FIXED: Always call useEffect hooks in the same order - no conditional dependencies
  React.useEffect(() => {
    const cachedModel = TreeAssetManager.getCachedModel(treeType);
    if (cachedModel) {
      setTreeModel(cachedModel);
    } else {
      TreeAssetManager.preloadAllModels().then(() => {
        const model = TreeAssetManager.getCachedModel(treeType);
        if (model) {
          setTreeModel(model);
        }
      });
    }
  }, [treeType]); // Only depend on treeType, not treeModel

  // FIXED: Always call this useEffect, but only execute logic when treeModel exists
  React.useEffect(() => {
    if (!treeModel) return;

    // Apply maximum visibility settings to the tree model
    treeModel.traverse((child) => {
      child.frustumCulled = false;
      child.matrixAutoUpdate = true;
      
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = false;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Force material visibility
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.side = THREE.DoubleSide;
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.visible = true;
              mat.needsUpdate = true;
            });
          } else {
            child.material.side = THREE.DoubleSide;
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.visible = true;
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }, [treeModel]); // This is safe now because we always call this hook

  // ENHANCED Y positioning with terrain integration and elevation boost
  const adjustedPosition: [number, number, number] = [
    position[0],
    Math.max(2.0, position[1] + TREE_Y_OFFSETS[treeType] + 2.0), // Much higher placement
    position[2]
  ];

  if (!treeModel) {
    return (
      <group 
        position={adjustedPosition} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
        frustumCulled={false} // CRITICAL: Never cull fallback trees
      >
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow frustumCulled={false}>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshLambertMaterial color="#8B4513" side={THREE.DoubleSide} transparent={false} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow frustumCulled={false}>
          <coneGeometry args={[0.6, 1.5, 8]} />
          <meshLambertMaterial 
            color={treeType === 'pine218' ? "#013220" : "#228B22"} 
            side={THREE.DoubleSide} 
            transparent={false}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group 
      position={adjustedPosition} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
      frustumCulled={false} // CRITICAL: Never cull the entire tree group
    >
      <primitive object={treeModel} frustumCulled={false} />
    </group>
  );
};

// Tree group component
const TreeGroup: React.FC<{
  positions: Array<{ 
    x: number; 
    y: number; 
    z: number; 
    scale: number; 
    rotation: number; 
    treeType: 'realistic' | 'stylized' | 'pine218';
  }>;
}> = ({ positions }) => {
  console.log(`EnhancedTreeDistribution: Rendering ${positions.length} enhanced visibility trees`);

  return (
    <group name="EnhancedVisibilityTreeGroup" frustumCulled={false}>
      {positions.map((pos, index) => (
        <GLBTree
          key={`enhanced-tree-${index}-${pos.treeType}-${pos.x}-${pos.z}`}
          position={[pos.x, pos.y, pos.z]}
          scale={pos.scale}
          rotation={pos.rotation}
          treeType={pos.treeType}
        />
      ))}
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

    console.log('EnhancedTreeDistribution: Generating trees with maximum visibility and anti-disappearance settings');
    const trees = [];
    const minDistance = 3; // Reduced for tighter placement
    const maxAttempts = 30;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      const treeCount = 2; // Fewer trees due to tighter constraints
      const allPositions = [];
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157 + chunk.x * 1000 + chunk.z * 100;
          
          // Controlled positioning between path and mountains
          const side = seededRandom(treeSeed + 10) > 0.5 ? 1 : -1;
          const sideOffset = 4.6 + seededRandom(treeSeed) * 0.2; // Very tight range: 4.6-4.8
          x = side * sideOffset;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.6;
          
          terrainHeight = getTerrainHeight(x, z);
          
          if (!isValidTreePosition(x, z)) {
            attempts++;
            continue;
          }
          
          treeType = getTreeType(treeSeed + 2);
          scale = getTreeScale(treeType, treeSeed + 3);
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          finalY = Math.max(2.0, terrainHeight + 2.0); // Much higher elevation for maximum visibility
          
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
    
    console.log(`EnhancedTreeDistribution: Generated ${trees.length} trees with maximum visibility settings`);
    return trees;
  }, [chunks.map(c => `${c.id}-${c.x}-${c.z}`).join(','), chunkSize, realm]);

  if (realm !== 'fantasy' || treePositions.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <TreeGroup positions={treePositions} />
    </Suspense>
  );
};

// Clear cache when component unmounts
export const clearTreeModelCache = () => {
  TreeAssetManager.clearCache();
  console.log('Tree model cache cleared');
};

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

// UPDATED: Check if position is within the central valley near the path
// Trees should spawn OUTSIDE this buffer to avoid lining up along the path
const isInMountainBoundary = (x: number, z: number): boolean => {
  // Valley around the path where trees shouldn't spawn
  const mountainBuffer = 5;
  return Math.abs(x) < mountainBuffer;
};

// UPDATED tree positioning with mountain boundary respect
const isValidTreePosition = (x: number, z: number): boolean => {
  const notInPlayerPath = !isInPlayerPath(x, z);
  const inValidXRange = Math.abs(x) >= 4 && Math.abs(x) <= 12; // Allow broader scatter
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

// ENHANCED Tree component with MAXIMUM anti-disappearance measures
const GLBTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine218';
}> = ({ position, scale, rotation, treeType }) => {
  // Use cached model
  const treeModel = useMemo(() => {
    return TreeAssetManager.getCachedModel(treeType);
  }, [treeType]);

  // ENHANCED: Apply MAXIMUM anti-disappearance settings
  const optimizedModel = useMemo(() => {
    if (!treeModel) return null;

    const model = treeModel.clone();
    
    // CRITICAL: Apply maximum anti-culling settings recursively
    const applyAntiCullingRecursive = (object: THREE.Object3D) => {
      object.frustumCulled = false;
      object.matrixAutoUpdate = true;
      object.matrixWorldNeedsUpdate = true;
      object.visible = true;
      
      if (object instanceof THREE.Mesh) {
        // ENHANCED: Maximum bounding box expansion
        if (object.geometry) {
          object.geometry.computeBoundingBox();
          object.geometry.computeBoundingSphere();
          
          if (object.geometry.boundingBox) {
            object.geometry.boundingBox.expandByScalar(5.0); // Massive expansion
          }
          if (object.geometry.boundingSphere) {
            object.geometry.boundingSphere.radius += 5.0; // Massive radius
          }
        }
        
        // ENHANCED: Force material visibility
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(mat => {
            mat.side = THREE.DoubleSide;
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.visible = true;
            mat.depthTest = true;
            mat.depthWrite = true;
            mat.needsUpdate = true;
            mat.fog = false; // Prevent fog from hiding trees
          });
        }
        
        object.castShadow = true;
        object.receiveShadow = true;
        object.renderOrder = 0;
      }
      
      // Apply to all children recursively
      object.children.forEach(child => applyAntiCullingRecursive(child));
    };

    applyAntiCullingRecursive(model);
    return model;
  }, [treeModel]);

  // FIXED: Ground level positioning
  const adjustedPosition: [number, number, number] = [
    position[0],
    -1.8 + TREE_Y_OFFSETS[treeType],
    position[2]
  ];

  if (!optimizedModel) {
    return (
      <group 
        position={adjustedPosition} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
        frustumCulled={false}
        matrixAutoUpdate={true}
        renderOrder={1}
      >
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow frustumCulled={false}>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshLambertMaterial 
            color="#8B4513" 
            side={THREE.DoubleSide} 
            transparent={false}
            fog={false}
          />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow frustumCulled={false}>
          <coneGeometry args={[0.6, 1.5, 8]} />
          <meshLambertMaterial 
            color={treeType === 'pine218' ? "#013220" : "#228B22"} 
            side={THREE.DoubleSide} 
            transparent={false}
            fog={false}
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
      frustumCulled={false}
      matrixAutoUpdate={true}
      renderOrder={1}
    >
      <primitive object={optimizedModel} frustumCulled={false} />
    </group>
  );
};

// Tree group component with ENHANCED visibility
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
  console.log(`EnhancedTreeDistribution: Rendering ${positions.length} trees with MAXIMUM anti-disappearance measures`);

  return (
    <group 
      name="EnhancedVisibilityTreeGroup" 
      frustumCulled={false}
      matrixAutoUpdate={true}
      renderOrder={1}
    >
      {positions.map((pos, index) => (
        <GLBTree
          key={`enhanced-tree-${index}-${pos.treeType}-${Math.round(pos.x)}-${Math.round(pos.z)}`}
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

    console.log('EnhancedTreeDistribution: Generating trees with MAXIMUM anti-disappearance measures');
    const trees = [];
    const minDistance = 3;
    const maxAttempts = 30;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      const treeCount = 3; // Increased slightly for better coverage
      const allPositions = [];
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157 + chunk.x * 1000 + chunk.z * 100;

          // Scatter trees randomly within the allowed X range
          x = (seededRandom(treeSeed) - 0.5) * 24; // [-12, 12]
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.6;
          
          terrainHeight = getTerrainHeight(x, z);
          
          if (!isValidTreePosition(x, z)) {
            attempts++;
            continue;
          }
          
          treeType = getTreeType(treeSeed + 2);
          scale = getTreeScale(treeType, treeSeed + 3);
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          finalY = -1.8; // Fixed ground level positioning
          
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
    
    console.log(`EnhancedTreeDistribution: Generated ${trees.length} trees with enhanced visibility measures`);
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

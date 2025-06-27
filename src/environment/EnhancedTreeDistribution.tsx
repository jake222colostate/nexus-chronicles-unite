
import React, { useMemo, Suspense } from 'react';
import { ChunkData } from '../components/ChunkSystem';
import * as THREE from 'three';
import { TreeAssetManager, TREE_DISTRIBUTION, TREE_SCALES, TREE_Y_OFFSETS } from './TreeAssetManager';
import { useRegisterCollider } from '@/lib/CollisionContext';

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

// OPTIMIZED: Simplified terrain height calculation
const getTerrainHeight = (x: number, z: number): number => {
  return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5;
};

// OPTIMIZED: Simplified mountain slope calculation
const getMountainSlopeHeight = (x: number, z: number): number => {
  const distanceFromCenter = Math.abs(x);
  
  if (distanceFromCenter < 15) {
    return getTerrainHeight(x, z);
  }
  
  const slopeStart = 15;
  const slopeDistance = distanceFromCenter - slopeStart;
  const slopeAngle = 0.15;
  const baseTerrainHeight = getTerrainHeight(x, z);
  const mountainHeight = slopeDistance * slopeAngle;
  
  return baseTerrainHeight + mountainHeight;
};

// OPTIMIZED: Simplified position validation
const isValidTreePosition = (x: number, z: number): boolean => {
  const notInPlayerPath = Math.abs(x) >= 4;
  const inValidXRange = Math.abs(x) <= 100; // Reduced range
  const notTooCloseToPlayer = Math.sqrt(x * x + (z + 10) * (z + 10)) > 6;
  
  return notInPlayerPath && inValidXRange && notTooCloseToPlayer;
};

// Get tree type - simplified
const getTreeType = (seed: number): 'realistic' | 'stylized' | 'pine218' => {
  const random = seededRandom(seed);
  if (random < 0.8) return 'pine218'; // Favor pine trees for better performance
  return 'stylized';
};

// Get randomized scale based on tree type
const getTreeScale = (treeType: 'realistic' | 'stylized' | 'pine218', seed: number): number => {
  const scaleConfig = TREE_SCALES[treeType];
  const random = seededRandom(seed);
  return scaleConfig.min + (random * (scaleConfig.max - scaleConfig.min));
};

// OPTIMIZED Tree component with minimal complexity
const GLBTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine218';
}> = ({ position, scale, rotation, treeType }) => {
  const treeModel = useMemo(() => {
    return TreeAssetManager.getCachedModel(treeType);
  }, [treeType]);

  const optimizedModel = useMemo(() => {
    if (!treeModel) return null;

    const model = treeModel.clone();
    
    // OPTIMIZED: Minimal optimization settings
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true; // Enable culling for better performance
        child.castShadow = false; // Disable shadows for performance
        child.receiveShadow = false;
        
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.needsUpdate = false; // Prevent unnecessary updates
          });
        }
      }
    });

    return model;
  }, [treeModel]);

  // OPTIMIZED: Simplified ground connection
  const groundHeight = getMountainSlopeHeight(position[0], position[2]);
  const adjustedY = groundHeight + TREE_Y_OFFSETS[treeType] - 1.8;

  const adjustedPosition: [number, number, number] = [
    position[0],
    adjustedY,
    position[2]
  ];

  // OPTIMIZED: Conditional collider registration
  if (Math.abs(position[0]) < 50) {
    useRegisterCollider(
      `tree-${position[0]}-${position[2]}`,
      new THREE.Vector3(...adjustedPosition),
      scale
    );
  }

  if (!optimizedModel) {
    return (
      <group 
        position={adjustedPosition} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
        frustumCulled={true}
      >
        <mesh position={[0, 0.5, 0]} frustumCulled={true}>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.2, 0]} frustumCulled={true}>
          <coneGeometry args={[0.6, 1.5, 6]} />
          <meshLambertMaterial color="#013220" />
        </mesh>
      </group>
    );
  }

  return (
    <group 
      position={adjustedPosition} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
      frustumCulled={true}
    >
      <primitive object={optimizedModel} frustumCulled={true} />
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

    const trees = [];
    const minDistance = 4; // Increased for better performance
    const maxAttempts = 20; // Reduced attempts

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      const treeCount = 3 + Math.floor(seededRandom(seed + 99) * 2); // Reduced tree count
      const allPositions = [];
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157 + chunk.x * 1000 + chunk.z * 100;

          x = (seededRandom(treeSeed) - 0.5) * 200; // Reduced spread
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.6;
          
          terrainHeight = getMountainSlopeHeight(x, z);
          
          if (!isValidTreePosition(x, z)) {
            attempts++;
            continue;
          }
          
          treeType = getTreeType(treeSeed + 2);
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
    
    return trees;
  }, [chunks.map(c => c.id).join(','), chunkSize, realm]); // Simplified dependency

  if (realm !== 'fantasy' || treePositions.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <group>
        {treePositions.slice(0, 100).map((tree, index) => ( // Limit to 100 trees max
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
};

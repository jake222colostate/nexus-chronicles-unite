
import React, { useMemo, Suspense, useRef, useState, useEffect } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
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

// Terrain height simulation function
const getTerrainHeight = (x: number, z: number): number => {
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 1.5 + 
                     Math.sin(x * 0.005) * Math.cos(z * 0.005) * 2.5;
  const jitter = (Math.sin(x * 0.1) * Math.cos(z * 0.1)) * 0.15;
  return baseHeight + jitter;
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

// Check if position is too close to player starting position
const isTooCloseToPlayerStart = (x: number, z: number): boolean => {
  const distance = Math.sqrt(x * x + (z + 10) * (z + 10));
  return distance < 8;
};

// Get tree type with specified distribution ratios
const getTreeType = (seed: number): 'realistic' | 'pine' => {
  const random = seededRandom(seed);
  return random < TREE_DISTRIBUTION.pine ? 'pine' : 'realistic';
};

// Get randomized scale based on tree type
const getTreeScale = (treeType: 'realistic' | 'pine', seed: number): number => {
  const scaleConfig = TREE_SCALES[treeType];
  const random = seededRandom(seed);
  return scaleConfig.min + (random * (scaleConfig.max - scaleConfig.min));
};

// Tree component that loads GLB models
const GLBTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'pine';
}> = ({ position, scale, rotation, treeType }) => {
  const [treeModel, setTreeModel] = useState<THREE.Object3D | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Try to get cached model first
    const cachedModel = TreeAssetManager.getCachedModel(treeType);
    if (cachedModel) {
      setTreeModel(cachedModel);
    } else {
      // If not cached, try to load it
      TreeAssetManager.preloadAllModels().then(() => {
        const model = TreeAssetManager.getCachedModel(treeType);
        if (model) {
          setTreeModel(model);
        }
      });
    }
  }, [treeType]);

  // Apply Y offset for proper alignment
  const adjustedPosition: [number, number, number] = [
    position[0],
    position[1] + TREE_Y_OFFSETS[treeType],
    position[2]
  ];

  if (!treeModel) {
    // Show placeholder while loading
    return (
      <group position={adjustedPosition} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.6, 8, 6]} />
          <meshLambertMaterial color="#228B22" />
        </mesh>
      </group>
    );
  }

  return (
    <group 
      ref={groupRef}
      position={adjustedPosition} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
    >
      <primitive object={treeModel} />
    </group>
  );
};

// Individual tree instance component with distance culling
const TreeInstance: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'pine';
  playerPosition: THREE.Vector3;
}> = ({ position, scale, rotation, treeType, playerPosition }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Performance culling based on distance
  useFrame(() => {
    const distance = playerPosition.distanceTo(new THREE.Vector3(...position));
    const newVisibility = distance <= 120; // 120m culling distance
    
    if (newVisibility !== isVisible) {
      setIsVisible(newVisibility);
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <GLBTree 
      position={position} 
      scale={scale} 
      rotation={rotation} 
      treeType={treeType}
    />
  );
};

// Performance-optimized tree group
const InstancedTreeGroup: React.FC<{
  positions: Array<{
    x: number;
    y: number;
    z: number;
    scale: number;
    rotation: number;
    treeType: 'realistic' | 'pine';
  }>;
  playerPosition: THREE.Vector3;
}> = ({ positions, playerPosition }) => {
  const visiblePositions = positions.filter(pos => {
    const distance = playerPosition.distanceTo(new THREE.Vector3(pos.x, pos.y, pos.z));
    return distance <= 120;
  });

  console.log(`EnhancedTreeDistribution: Rendering ${visiblePositions.length} trees from assets`);

  return (
    <group name="AssetTreeGroup">
      {visiblePositions.slice(0, 50).map((pos, index) => (
        <TreeInstance
          key={`github-tree-${index}-${pos.treeType}`}
          position={[pos.x, pos.y, pos.z]}
          scale={pos.scale}
          rotation={pos.rotation}
          treeType={pos.treeType}
          playerPosition={playerPosition}
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
  // Generate tree positions with new distribution ratios
  const { treePositions, playerPosition } = useMemo(() => {
    // Only generate for fantasy realm
    if (realm !== 'fantasy') {
      return {
        treePositions: [],
        playerPosition: new THREE.Vector3(0, 0, 0)
      };
    }

    console.log('EnhancedTreeDistribution: Generating tree positions with asset models for', chunks.length, 'chunks');
    const trees = [];
    const minDistance = 3; // 3m minimum spacing as specified
    const maxAttempts = 30;
    const allPositions = [];

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 3-5 trees per chunk for good density
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157;
          
          // Random placement within chunk bounds
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.8;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          terrainHeight = getTerrainHeight(x, z);
          
          // Skip invalid positions (paths, steep slopes, too close to start)
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z) || isTooCloseToPlayerStart(x, z)) {
            attempts++;
            continue;
          }
          
          // Get tree type with new distribution ratios
          treeType = getTreeType(treeSeed + 2);
          
          // Get randomized scale based on tree type
          scale = getTreeScale(treeType, treeSeed + 3);
          
          // Random Y-axis rotation (0°–360°)
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          finalY = terrainHeight;
          
          // Check minimum 3-meter distance from existing trees
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
    
    // Player position for distance calculations
    const avgX = chunks.reduce((sum, chunk) => sum + chunk.worldX, 0) / chunks.length;
    const avgZ = chunks.reduce((sum, chunk) => sum + chunk.worldZ, 0) / chunks.length;
    
    console.log(`EnhancedTreeDistribution: Generated ${trees.length} trees with asset models`);
    console.log('Tree distribution:', {
      pine: trees.filter(t => t.treeType === 'pine').length,
      realistic: trees.filter(t => t.treeType === 'realistic').length
    });
    
    return {
      treePositions: trees,
      playerPosition: new THREE.Vector3(avgX, 0, avgZ)
    };
  }, [chunks.map(c => c.id).join(','), chunkSize, realm]);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('EnhancedTreeDistribution: Not fantasy realm, skipping');
    return null;
  }

  if (treePositions.length === 0) {
    console.log('EnhancedTreeDistribution: No tree positions generated');
    return null;
  }

  return (
    <Suspense fallback={null}>
      <InstancedTreeGroup
        positions={treePositions}
        playerPosition={playerPosition}
      />
    </Suspense>
  );
};

// Clear cache when component unmounts
export const clearTreeModelCache = () => {
  TreeAssetManager.clearCache();
  console.log('Tree model cache cleared');
};

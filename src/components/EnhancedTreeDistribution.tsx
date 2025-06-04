
import React, { useMemo, Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Use local GLB files instead of broken external URLs
const TREE_MODELS = {
  realistic: '/stylized_tree.glb', // Using stylized as realistic fallback
  stylized: '/stylized_tree.glb',
  pine: '/pine_tree_218poly.glb'
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

// Terrain height simulation function with height jitter
const getTerrainHeight = (x: number, z: number): number => {
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 1.5 + 
                     Math.sin(x * 0.005) * Math.cos(z * 0.005) * 2.5;
  
  // Add natural terrain blending jitter
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

// Check if position is too close to player starting position - 8 meter buffer
const isTooCloseToPlayerStart = (x: number, z: number): boolean => {
  const playerStartX = 0;
  const playerStartZ = -10;
  const safetyBuffer = 8;
  
  const distance = Math.sqrt(
    Math.pow(x - playerStartX, 2) + Math.pow(z - playerStartZ, 2)
  );
  
  return distance < safetyBuffer;
};

// Get tree type with 33% distribution
const getTreeType = (seed: number): 'realistic' | 'stylized' | 'pine' => {
  const random = seededRandom(seed);
  if (random < 0.33) return 'realistic';
  if (random < 0.66) return 'stylized';
  return 'pine';
};

// Get appropriate scale based on tree type
const getTreeScale = (treeType: 'realistic' | 'stylized' | 'pine', seed: number): number => {
  const random = seededRandom(seed);
  switch (treeType) {
    case 'realistic':
      return 0.7 + random * 0.15; // 0.7 to 0.85
    case 'stylized':
      return 1.2 + random * 0.2; // 1.2 to 1.4
    case 'pine':
      return 0.45 + random * 0.15; // 0.45 to 0.6
    default:
      return 1.0;
  }
};

// Get Y position adjustment for stylized trees
const getYAdjustment = (treeType: 'realistic' | 'stylized' | 'pine'): number => {
  return treeType === 'stylized' ? -0.25 : 0;
};

// Fallback tree component using basic geometry
const FallbackTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine';
}> = ({ position, scale, rotation, treeType }) => {
  const getTreeGeometry = () => {
    switch (treeType) {
      case 'pine':
        return (
          <group>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.15, 1]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.6, 1.5, 8]} />
              <meshLambertMaterial color="#013220" />
            </mesh>
          </group>
        );
      case 'stylized':
        return (
          <group>
            <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.12, 0.18, 1.2]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.8, 12, 8]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
          </group>
        );
      default: // realistic
        return (
          <group>
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.2, 1.6]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1.0, 12, 8]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
          </group>
        );
    }
  };

  return (
    <group 
      position={position} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
    >
      {getTreeGeometry()}
    </group>
  );
};

// Individual tree instance component
const TreeInstance: React.FC<{
  modelUrl: string;
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine';
}> = ({ modelUrl, position, scale, rotation, treeType }) => {
  try {
    const { scene } = useGLTF(modelUrl);
    
    if (!scene) {
      console.warn(`Tree model not loaded for ${treeType}, using fallback`);
      return (
        <FallbackTree 
          position={position} 
          scale={scale} 
          rotation={rotation} 
          treeType={treeType}
        />
      );
    }

    // Clone and ensure all meshes are visible
    const clonedScene = useMemo(() => {
      const sceneClone = scene.clone();
      sceneClone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.visible = true; // Ensure visibility
          if (child.material && 'needsUpdate' in child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
      return sceneClone;
    }, [scene]);

    return (
      <group 
        position={position} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
      >
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    console.warn(`Failed to load ${treeType} tree model, using fallback:`, error);
    return (
      <FallbackTree 
        position={position} 
        scale={scale} 
        rotation={rotation} 
        treeType={treeType}
      />
    );
  }
};

// Performance-optimized instanced tree group
const InstancedTreeGroup: React.FC<{
  positions: Array<{ 
    x: number; 
    y: number; 
    z: number; 
    scale: number; 
    rotation: number; 
    treeType: 'realistic' | 'stylized' | 'pine';
  }>;
  playerPosition: THREE.Vector3;
}> = ({ positions, playerPosition }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Filter positions by distance for performance
  const visiblePositions = useMemo(() => {
    const renderDistance = 150;
    return positions.filter(pos => {
      const distance = playerPosition.distanceTo(new THREE.Vector3(pos.x, pos.y, pos.z));
      return distance <= renderDistance;
    });
  }, [positions, playerPosition]);

  return (
    <group ref={groupRef} name="TreeGroup">
      {visiblePositions.map((pos, index) => {
        const modelUrl = TREE_MODELS[pos.treeType];
        return (
          <TreeInstance
            key={`tree-${index}-${pos.treeType}`}
            modelUrl={modelUrl}
            position={[pos.x, pos.y, pos.z]}
            scale={pos.scale}
            rotation={pos.rotation}
            treeType={pos.treeType}
          />
        );
      })}
    </group>
  );
};

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate tree positions with optimized algorithm
  const { treePositions, playerPosition } = useMemo(() => {
    const trees = [];
    const minDistance = 3; // 3m minimum distance as specified
    const maxAttempts = 25;
    const allPositions = [];

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 2-4 trees per chunk
      const treeCount = 2 + Math.floor(seededRandom(seed) * 3);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157;
          
          // Random jittered placement within chunk bounds
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.8;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          terrainHeight = getTerrainHeight(x, z);
          
          // Skip if on player path, steep slope, or too close to player start
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z) || isTooCloseToPlayerStart(x, z)) {
            attempts++;
            continue;
          }
          
          // Get tree type with 33% distribution
          treeType = getTreeType(treeSeed + 2);
          
          // Get appropriate scale for tree type
          scale = getTreeScale(treeType, treeSeed + 3);
          
          // Random Y-axis rotation (0°–360°)
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Apply Y position adjustment for stylized trees
          finalY = terrainHeight + getYAdjustment(treeType);
          
          // Check minimum distance from existing trees (3m as specified)
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
    
    // Player position for LOD calculations
    const avgX = chunks.reduce((sum, chunk) => sum + chunk.worldX, 0) / chunks.length;
    const avgZ = chunks.reduce((sum, chunk) => sum + chunk.worldZ, 0) / chunks.length;
    
    return {
      treePositions: trees,
      playerPosition: new THREE.Vector3(avgX, 0, avgZ)
    };
  }, [chunks.map(c => c.id).join(','), chunkSize]);

  return (
    <Suspense fallback={null}>
      {treePositions.length > 0 && (
        <InstancedTreeGroup
          positions={treePositions}
          playerPosition={playerPosition}
        />
      )}
    </Suspense>
  );
};

// Preload models for better performance - with error handling
Object.values(TREE_MODELS).forEach(url => {
  try {
    useGLTF.preload(url);
    console.log(`Preloading tree model: ${url}`);
  } catch (error) {
    console.warn(`Failed to preload tree model ${url}, will use fallback:`, error);
  }
});

// Clear unused model cache
export const clearTreeModelCache = () => {
  Object.values(TREE_MODELS).forEach(url => {
    useGLTF.clear(url);
  });
};

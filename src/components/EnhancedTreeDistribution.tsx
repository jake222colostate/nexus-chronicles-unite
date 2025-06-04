
import React, { useMemo, Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Single tree model URL from Netlify deployment
const TREE_MODEL_URL = 'https://stately-liger-80d127.netlify.app/stylized_tree.glb';

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

// Scale range for stylized trees (0.6× – 0.8×)
const getTreeScale = (seed: number): number => {
  const random = seededRandom(seed);
  return 0.6 + random * 0.2; // 0.6× – 0.8×
};

// Performance-optimized instanced tree component
const InstancedTreeGroup: React.FC<{
  positions: Array<{ x: number; y: number; z: number; scale: number; rotation: number; }>;
  playerPosition: THREE.Vector3;
}> = ({ positions, playerPosition }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Load GLB with error handling - ALWAYS call hooks before any conditional logic
  let gltfResult = null;
  let loadError = false;
  
  try {
    gltfResult = useGLTF(TREE_MODEL_URL);
  } catch (error) {
    console.warn(`Failed to load stylized tree model:`, error);
    loadError = true;
  }
  
  // ALWAYS call useFrame hook regardless of conditions
  useFrame(() => {
    // Only proceed if we have valid data and no errors
    if (loadError || !gltfResult?.scene || !meshRef.current || !playerPosition || positions.length === 0) {
      return;
    }
    
    const tempMatrix = new THREE.Matrix4();
    const renderDistance = 150;
    const lodDistance = 75;
    let visibleCount = 0;
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const distance = playerPosition.distanceTo(new THREE.Vector3(pos.x, pos.y, pos.z));
      
      // Skip if outside render distance
      if (distance > renderDistance) {
        continue;
      }
      
      // LOD system: reduce scale for distant trees
      const lodScale = distance > lodDistance ? pos.scale * 0.6 : pos.scale;
      
      tempMatrix.compose(
        new THREE.Vector3(pos.x, pos.y, pos.z),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pos.rotation),
        new THREE.Vector3(lodScale, lodScale, lodScale)
      );
      
      meshRef.current.setMatrixAt(visibleCount, tempMatrix);
      visibleCount++;
    }
    
    // Update instance count for performance
    meshRef.current.count = visibleCount;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // After all hooks are called, handle conditional rendering
  if (loadError || !gltfResult?.scene || positions.length === 0) {
    return null;
  }

  // Get geometry and material from the model
  let geometry: THREE.BufferGeometry | null = null;
  let material: THREE.Material | null = null;
  
  gltfResult.scene.traverse((child) => {
    if (child instanceof THREE.Mesh && !geometry) {
      geometry = child.geometry;
      material = child.material;
    }
  });

  if (!geometry || !material) {
    return null;
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, positions.length]}
      castShadow
      receiveShadow
      frustumCulled={true}
    />
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
        let x, z, terrainHeight, scale, rotation, finalY;
        
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
          
          // Get appropriate scale for stylized tree (0.6× – 0.8×)
          scale = getTreeScale(treeSeed + 3);
          
          // Random Y-axis rotation (0°–360°)
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Place tree base on terrain
          finalY = terrainHeight;
          
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
          const position = { x, y: finalY, z, scale, rotation };
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
    <group name="TreeGroup">
      <Suspense fallback={null}>
        {/* Instanced Stylized Trees (100%) */}
        {treePositions.length > 0 && (
          <InstancedTreeGroup
            positions={treePositions}
            playerPosition={playerPosition}
          />
        )}
      </Suspense>
    </group>
  );
};

// Preload model for better performance
try {
  useGLTF.preload(TREE_MODEL_URL);
} catch (error) {
  console.warn(`Failed to preload stylized tree model:`, error);
}

// Clear unused model cache
export const clearTreeModelCache = () => {
  useGLTF.clear(TREE_MODEL_URL);
};

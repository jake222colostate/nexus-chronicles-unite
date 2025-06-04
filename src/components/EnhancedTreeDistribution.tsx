
import React, { useMemo, Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Tree model URLs from new Netlify deployment
const TREE_MODELS = {
  pine218: 'https://bucolic-crostata-18dca7.netlify.app/pine_tree_218poly.glb',
  stylized: 'https://bucolic-crostata-18dca7.netlify.app/stylized_tree.glb'
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

// Check if position is too close to player starting position - 8 meter buffer
const isTooCloseToPlayerStart = (x: number, z: number): boolean => {
  const playerStartX = 0; // Player starts at origin
  const playerStartZ = -10; // Player starts at z = -10
  const safetyBuffer = 8; // 8m buffer around player
  
  const distance = Math.sqrt(
    Math.pow(x - playerStartX, 2) + Math.pow(z - playerStartZ, 2)
  );
  
  return distance < safetyBuffer;
};

// Determine tree type based on 50/50 distribution
const getTreeTypeByDistribution = (seed: number): 'pine218' | 'stylized' => {
  const random = seededRandom(seed);
  return random < 0.5 ? 'pine218' : 'stylized';
};

// Updated scale ranges with new stylized tree specifications
const getScaleForTreeType = (treeType: 'pine218' | 'stylized', seed: number): number => {
  const random = seededRandom(seed);
  
  switch (treeType) {
    case 'pine218':
      return 2.8 + random * 0.5; // 2.8 to 3.3 scale
    case 'stylized':
      return 1.4 + random * 0.2; // 1.4 to 1.6 scale (NEW: reduced from 2.5-3.0)
    default:
      return 1.0;
  }
};

// Performance-optimized instanced tree component with stylized tree trunk fix
const InstancedTreeGroup: React.FC<{
  modelUrl: string;
  treeType: 'pine218' | 'stylized';
  positions: Array<{ x: number; y: number; z: number; scale: number; rotation: number; }>;
  playerPosition: THREE.Vector3;
}> = ({ modelUrl, treeType, positions, playerPosition }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Load GLB with error handling - no fallback geometry
  let gltfResult;
  
  try {
    gltfResult = useGLTF(modelUrl);
  } catch (error) {
    console.warn(`Failed to load tree model ${treeType}:`, error);
    gltfResult = null;
  }
  
  // Always call useFrame
  useFrame(() => {
    if (meshRef.current && playerPosition && positions.length > 0) {
      const tempMatrix = new THREE.Matrix4();
      const renderDistance = 200;
      const lodDistance = 100;
      
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const distance = playerPosition.distanceTo(new THREE.Vector3(pos.x, pos.y, pos.z));
        
        // Skip if outside render distance
        if (distance > renderDistance) {
          continue;
        }
        
        // Simple LOD: reduce scale for distant trees
        const lodScale = distance > lodDistance ? pos.scale * 0.5 : pos.scale;
        
        // Apply stylized tree trunk fix: lower Y-position by 0.3 to bury excessive trunk
        const adjustedY = treeType === 'stylized' ? pos.y - 0.3 : pos.y;
        
        tempMatrix.compose(
          new THREE.Vector3(pos.x, adjustedY, pos.z),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pos.rotation),
          new THREE.Vector3(lodScale, lodScale, lodScale)
        );
        
        meshRef.current.setMatrixAt(i, tempMatrix);
      }
      
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Skip rendering if GLB failed to load - no fallback geometry
  if (!gltfResult?.scene || positions.length === 0) {
    console.log(`GLB load failed or no positions for ${treeType}, skipping render - no fallback`);
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
    console.log(`No valid geometry/material found for ${treeType}, skipping render`);
    return null;
  }

  console.log(`Successfully rendering ${treeType} from new Netlify - ${positions.length} instances ${treeType === 'stylized' ? '(with trunk fix)' : ''}`);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, positions.length]}
      castShadow
      receiveShadow
    />
  );
};

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('EnhancedTreeDistribution render - Realm:', realm, 'Chunks:', chunks.length, 'Using new Netlify URLs with stylized tree trunk fix');

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('EnhancedTreeDistribution: Not fantasy realm, skipping');
    return null;
  }

  // Generate tree positions with updated scaling and spacing requirements
  const { pine218Positions, stylizedPositions, playerPosition } = useMemo(() => {
    console.log('Generating tree positions with new Netlify models, stylized tree scaling (1.4-1.6×), and 3m spacing');
    
    const pine218Trees = [];
    const stylizedTrees = [];
    const minDistance = 3; // 3 meter minimum spacing (UPDATED from previous value)
    const maxAttempts = 30;
    const allPositions = [];

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 3-5 trees per chunk
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
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
          
          // Skip if on player path, steep slope, or too close to player start (8m buffer)
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z) || isTooCloseToPlayerStart(x, z)) {
            attempts++;
            continue;
          }
          
          // Determine tree type based on 50/50 distribution
          treeType = getTreeTypeByDistribution(treeSeed + 2);
          
          // Get appropriate scale for tree type with NEW stylized tree specifications
          scale = getScaleForTreeType(treeType, treeSeed + 3);
          
          // Random Y-axis rotation (0°–360°)
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Place tree base on terrain
          finalY = terrainHeight;
          
          // Check minimum distance from existing trees (3m spacing)
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
          
          if (treeType === 'pine218') {
            pine218Trees.push(position);
          } else {
            stylizedTrees.push(position);
          }
          
          console.log(`${treeType} tree (new Netlify) placed at (${x.toFixed(2)}, ${finalY.toFixed(2)}, ${z.toFixed(2)}) with scale ${scale.toFixed(2)} rotation ${(rotation * 180 / Math.PI).toFixed(0)}° ${treeType === 'stylized' ? '(will apply trunk fix)' : ''}`);
        } else {
          console.log(`Failed to place tree after ${maxAttempts} attempts in chunk ${chunk.id}`);
        }
      }
    });
    
    // Log distribution statistics
    const pine218Count = pine218Trees.length;
    const stylizedCount = stylizedTrees.length;
    const total = allPositions.length;
    
    console.log(`Total trees generated from new Netlify: ${total}`);
    console.log(`Pine 218 trees (scale 2.8-3.3): ${pine218Count} (${total > 0 ? ((pine218Count/total)*100).toFixed(1) : 0}%)`);
    console.log(`Stylized trees (scale 1.4-1.6 + trunk fix): ${stylizedCount} (${total > 0 ? ((stylizedCount/total)*100).toFixed(1) : 0}%)`);
    
    // Player position for LOD calculations
    const avgX = chunks.reduce((sum, chunk) => sum + chunk.worldX, 0) / chunks.length;
    const avgZ = chunks.reduce((sum, chunk) => sum + chunk.worldZ, 0) / chunks.length;
    
    return {
      pine218Positions: pine218Trees,
      stylizedPositions: stylizedTrees,
      playerPosition: new THREE.Vector3(avgX, 0, avgZ)
    };
  }, [chunks, chunkSize]);

  return (
    <group name="TreeGroup">
      <Suspense fallback={null}>
        {/* Instanced Pine 218 Trees from new Netlify */}
        {pine218Positions.length > 0 && (
          <InstancedTreeGroup
            modelUrl={TREE_MODELS.pine218}
            treeType="pine218"
            positions={pine218Positions}
            playerPosition={playerPosition}
          />
        )}
        
        {/* Instanced Stylized Trees from new Netlify with trunk fix */}
        {stylizedPositions.length > 0 && (
          <InstancedTreeGroup
            modelUrl={TREE_MODELS.stylized}
            treeType="stylized"
            positions={stylizedPositions}
            playerPosition={playerPosition}
          />
        )}
      </Suspense>
    </group>
  );
};

// Preload models for better performance
console.log('Preloading new Netlify GLB tree models...');
Object.entries(TREE_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded ${type} tree model from new Netlify:`, url);
  } catch (error) {
    console.warn(`Failed to preload ${type} tree model from new Netlify:`, error);
  }
});

// Clear unused model cache
export const clearTreeModelCache = () => {
  Object.values(TREE_MODELS).forEach(url => {
    useGLTF.clear(url);
  });
  console.log('Cleared tree model cache for memory optimization');
};

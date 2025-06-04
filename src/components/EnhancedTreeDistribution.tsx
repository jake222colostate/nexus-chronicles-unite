import React, { useMemo, Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Updated tree model URLs from your specifications
const TREE_MODELS = {
  pine218: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/env/pine_tree_218poly.glb',
  stylized: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/env/stylized_tree%20(1).glb'
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

// Check if position is too close to player starting position
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

// Updated scale ranges
const getScaleForTreeType = (treeType: 'pine218' | 'stylized', seed: number): number => {
  const random = seededRandom(seed);
  
  switch (treeType) {
    case 'pine218':
      return 2.5 + random * 0.5; // 2.5 to 3.0 - pine tree scales normally
    case 'stylized':
      return 1.0 + random * 0.3; // 1.0 to 1.3 - base scale for stylized tree
    default:
      return 1.0;
  }
};

// Get Y-offset to fix pivot positioning
const getYOffsetForTreeType = (treeType: 'pine218' | 'stylized', scale: number): number => {
  switch (treeType) {
    case 'pine218':
      return 0; // Pine tree has proper base pivot
    case 'stylized':
      return scale * 2.0; // Stylized tree origin is at top, offset to place base on ground
    default:
      return 0;
  }
};

// FIXED: Apply proper trunk proportion corrections for stylized tree
const applyTrunkProportionFix = (scene: THREE.Object3D, treeType: 'pine218' | 'stylized') => {
  if (treeType === 'stylized') {
    let hasSeparateMeshes = false;
    let trunkMeshFound = false;
    let canopyMeshFound = false;
    
    // First pass: Check if we have separate trunk and canopy meshes
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name.toLowerCase();
        
        if (meshName.includes('trunk') || meshName.includes('stem') || 
            meshName.includes('bark') || meshName.includes('wood')) {
          trunkMeshFound = true;
        }
        
        if (meshName.includes('leaf') || meshName.includes('canopy') || 
            meshName.includes('foliage') || meshName.includes('crown')) {
          canopyMeshFound = true;
        }
      }
    });
    
    hasSeparateMeshes = trunkMeshFound && canopyMeshFound;
    
    if (hasSeparateMeshes) {
      // CASE 1: Separate trunk and canopy meshes - apply independent scaling
      console.log('Stylized tree has separate meshes - applying independent scaling');
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name.toLowerCase();
          
          // Scale trunk mesh: X=0.4, Y=0.4, Z=0.4 (reduce thickness and height)
          if (meshName.includes('trunk') || meshName.includes('stem') || 
              meshName.includes('bark') || meshName.includes('wood')) {
            console.log(`Applying trunk scaling to: ${child.name}`);
            child.scale.set(0.4, 0.4, 0.4);
          }
          
          // Keep canopy scale unchanged to preserve appearance
          else if (meshName.includes('leaf') || meshName.includes('canopy') || 
                   meshName.includes('foliage') || meshName.includes('crown')) {
            console.log(`Keeping canopy scale unchanged: ${child.name}`);
            child.scale.set(1.0, 1.0, 1.0);
          }
        }
      });
    } else {
      // CASE 2: Single mesh - apply non-uniform scaling transformation
      console.log('Stylized tree is single mesh - applying non-uniform scaling');
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Apply non-uniform scaling: Y=0.65 (compress vertical), X/Z=0.6 (compress width/depth)
          console.log(`Applying non-uniform scaling to single mesh: ${child.name}`);
          child.scale.set(0.6, 0.65, 0.6);
          
          // Adjust position to ensure canopy stays visually aligned to the top
          const geometry = child.geometry;
          if (geometry && geometry.boundingBox) {
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;
            const originalHeight = bbox.max.y - bbox.min.y;
            const newHeight = originalHeight * 0.65;
            const heightDifference = originalHeight - newHeight;
            
            // Move the mesh up by half the height difference to keep top aligned
            child.position.y += heightDifference * 0.5;
          }
        }
      });
    }
  }
  
  return scene;
};

// Performance-optimized instanced tree component with trunk proportion fix
const InstancedTreeGroup: React.FC<{
  modelUrl: string;
  treeType: 'pine218' | 'stylized';
  positions: Array<{ x: number; y: number; z: number; scale: number; rotation: number; }>;
  playerPosition: THREE.Vector3;
}> = ({ modelUrl, treeType, positions, playerPosition }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lodDistance = 100; // LOD switching distance
  
  try {
    const { scene } = useGLTF(modelUrl);
    
    if (!scene || positions.length === 0) {
      return null;
    }

    // FIXED: Apply trunk proportion corrections for stylized trees
    const processedScene = applyTrunkProportionFix(scene.clone(), treeType);

    // Get geometry and material from the processed model
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.Material | null = null;
    
    processedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && !geometry) {
        geometry = child.geometry;
        material = child.material;
      }
    });

    if (!geometry || !material) {
      console.log(`No valid geometry/material found for ${treeType}, skipping entirely`);
      return null; // Skip tree entirely if GLB fails to load - no geometric fallback
    }

    console.log(`Successfully loaded ${treeType} with FIXED trunk proportions - ${positions.length} instances`);

    // Performance optimization: Use LOD based on distance and automatically discard outside render distance
    useFrame(() => {
      if (meshRef.current && playerPosition) {
        const tempMatrix = new THREE.Matrix4();
        const tempPosition = new THREE.Vector3();
        const renderDistance = 200; // Automatically discard objects outside render distance
        
        for (let i = 0; i < positions.length; i++) {
          const pos = positions[i];
          const distance = playerPosition.distanceTo(new THREE.Vector3(pos.x, pos.y, pos.z));
          
          // Skip if outside render distance
          if (distance > renderDistance) {
            continue;
          }
          
          // Simple LOD: reduce scale for distant trees
          const lodScale = distance > lodDistance ? pos.scale * 0.5 : pos.scale;
          
          tempMatrix.compose(
            new THREE.Vector3(pos.x, pos.y, pos.z),
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pos.rotation),
            new THREE.Vector3(lodScale, lodScale, lodScale)
          );
          
          meshRef.current.setMatrixAt(i, tempMatrix);
        }
        
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    });

    return (
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, positions.length]}
        castShadow
        receiveShadow
      />
    );
  } catch (error) {
    console.log(`Failed to load ${treeType} model, skipping entirely:`, error);
    return null; // Skip tree entirely if GLB fails to load - no geometric fallback
  }
};

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('EnhancedTreeDistribution render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('EnhancedTreeDistribution: Not fantasy realm, skipping');
    return null;
  }

  // Generate tree positions with trunk proportion fixes
  const { pine218Positions, stylizedPositions, playerPosition } = useMemo(() => {
    console.log('Generating tree positions with FIXED trunk proportions for', chunks.length, 'chunks');
    
    const pine218Trees = [];
    const stylizedTrees = [];
    const minDistance = 3; // 3 meter minimum spacing between trees
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
        let x, z, terrainHeight, treeType, scale, rotation, yOffset, finalY;
        
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
          
          // Determine tree type based on 50/50 distribution
          treeType = getTreeTypeByDistribution(treeSeed + 2);
          
          // Get appropriate scale for tree type
          scale = getScaleForTreeType(treeType, treeSeed + 3);
          
          // Randomize Y-axis rotation (0°–360°)
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Calculate Y-offset - tree base must align with terrain
          yOffset = getYOffsetForTreeType(treeType, scale);
          finalY = terrainHeight + yOffset;
          
          // Check minimum distance from existing trees
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
          
          console.log(`${treeType} tree placed at (${x.toFixed(2)}, ${finalY.toFixed(2)}, ${z.toFixed(2)}) with scale ${scale.toFixed(2)} ${treeType === 'stylized' ? '(TRUNK PROPORTIONS FIXED)' : ''}`);
        } else {
          console.log(`Failed to place tree after ${maxAttempts} attempts in chunk ${chunk.id}`);
        }
      }
    });
    
    // Log distribution statistics
    const pine218Count = pine218Trees.length;
    const stylizedCount = stylizedTrees.length;
    const total = allPositions.length;
    
    console.log(`Total trees generated: ${total}`);
    console.log(`Pine 218 trees: ${pine218Count} (${total > 0 ? ((pine218Count/total)*100).toFixed(1) : 0}%)`);
    console.log(`Stylized trees (TRUNK PROPORTIONS FIXED): ${stylizedCount} (${total > 0 ? ((stylizedCount/total)*100).toFixed(1) : 0}%)`);
    
    // Player position for LOD calculations (approximate center of chunks)
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
        {/* Instanced Pine 218 Trees */}
        {pine218Positions.length > 0 && (
          <InstancedTreeGroup
            modelUrl={TREE_MODELS.pine218}
            treeType="pine218"
            positions={pine218Positions}
            playerPosition={playerPosition}
          />
        )}
        
        {/* Instanced Stylized Trees with Fixed Trunk Proportions */}
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
console.log('Preloading GLB tree models...');
Object.entries(TREE_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded ${type} tree model from:`, url);
  } catch (error) {
    console.warn(`Failed to preload ${type} tree model:`, error);
  }
});

// Clear unused model cache
export const clearTreeModelCache = () => {
  Object.values(TREE_MODELS).forEach(url => {
    useGLTF.clear(url);
  });
  console.log('Cleared tree model cache for memory optimization');
};


import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh, Vector3 } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { TreeAssetManager, TREE_SCALES, TREE_Y_OFFSETS } from '../environment/TreeAssetManager';

interface EnvironmentChunk {
  id: number;
  z: number;
  mountains: Group[];
  trees: Group[];
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// ENHANCED: Calculate proper mountain slope height for tree grounding
const getMountainSlopeHeight = (x: number, z: number): number => {
  const distanceFromCenter = Math.abs(x);
  
  // Valley floor (close to path)
  if (distanceFromCenter < 15) {
    const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5;
    return Math.max(0, baseHeight);
  }
  
  // Mountain slope calculation - gradual rise
  const slopeStart = 15;
  const slopeDistance = distanceFromCenter - slopeStart;
  const slopeAngle = 0.15; // Gentle slope to match mountain positioning
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5;
  const mountainHeight = slopeDistance * slopeAngle;
  
  // Add natural variation
  const variation = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 0.3;
  
  return Math.max(0, baseHeight + mountainHeight + variation);
};

// ADJUSTED: Mountains much further from path to prevent clipping
const isWithinMountainBoundaries = (x: number): boolean => {
  return Math.abs(x) > 15 && Math.abs(x) < 200;
};

// Ensure NO obstacles on the main player path
const isOnPlayerPath = (x: number): boolean => {
  return Math.abs(x) < 12;
};

interface InfiniteEnvironmentSystemProps {
  playerPosition: Vector3;
}

export const InfiniteEnvironmentSystem: React.FC<InfiniteEnvironmentSystemProps> = ({ playerPosition }) => {
  const { scene } = useThree();
  const { scene: mountainModel } = useGLTF('/assets/mountain_low_poly.glb');
  const [chunks, setChunks] = useState<EnvironmentChunk[]>([]);
  const chunksRef = useRef<EnvironmentChunk[]>([]);
  const playerPositionRef = useRef(new Vector3(0, 0, 0));
  const lastUpdateRef = useRef(0);
  
  // FIXED: Much longer update intervals to prevent blinking
  const CHUNK_SIZE = 25;
  // FIXED: Higher render distance for fantasy world infinite environment
  const RENDER_DISTANCE = 250; // Increased from 200 to 250
  const CLEANUP_DISTANCE = 450; // Increased from 400 to 450
  const UPDATE_INTERVAL = 300; // Reduced from 500ms to 300ms for more responsive loading

  // Create a mountain at specified position - LOWERED into ground
  const createMountain = (x: number, z: number, seed: number): Group | null => {
    if (!mountainModel) return null;
    
    const mountain = mountainModel.clone() as Group;
    
    // Enhanced variations for natural appearance
    const offsetVariation = (seededRandom(seed) - 0.5) * 8;
    const scaleVariation = 0.06 + (seededRandom(seed + 1) * 0.08);
    const heightVariation = (seededRandom(seed + 2) - 0.5) * 4;
    const rotationVariation = seededRandom(seed + 3) * Math.PI * 0.3;
    
    // Apply positioning - mountains LOWERED into ground to prevent clipping
    mountain.position.set(
      x + offsetVariation, 
      -8 + heightVariation,
      z + (seededRandom(seed + 4) - 0.5) * 3
    );
    
    mountain.scale.set(
      x < 0 ? -scaleVariation : scaleVariation, 
      scaleVariation, 
      scaleVariation
    );
    mountain.rotation.y = rotationVariation;
    
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    mountain.frustumCulled = false; // Prevent blinking
    
    mountain.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Prevent blinking
      }
    });
    
    return mountain;
  };

  // ENHANCED: Create a tree with proper ground connection
  const createTree = async (x: number, z: number, treeType: 'realistic' | 'stylized' | 'pine218', scale: number, rotation: number): Promise<Group | null> => {
    try {
      const treeModel = TreeAssetManager.getCachedModel(treeType);
      if (!treeModel) {
        console.warn(`Tree model ${treeType} not cached`);
        return null;
      }
      
      const tree = treeModel.clone() as Group;
      
      // ENHANCED: Proper ground connection with mountain slope calculation
      const groundHeight = getMountainSlopeHeight(x, z);
      const yPosition = groundHeight + TREE_Y_OFFSETS[treeType] - 1.8;
      
      tree.position.set(x, yPosition, z);
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = rotation;
      tree.castShadow = true;
      tree.receiveShadow = true;
      tree.frustumCulled = false; // Prevent disappearing
      
      tree.traverse((child) => {
        if ((child as Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false; // Prevent blinking
        }
      });
      
      return tree;
    } catch (error) {
      console.error('Failed to create tree:', error);
      return null;
    }
  };

  // Generate a new environment chunk with properly grounded trees
  const generateChunk = async (chunkId: number): Promise<EnvironmentChunk> => {
    const chunkZ = -chunkId * CHUNK_SIZE;
    const mountains: Group[] = [];
    const trees: Group[] = [];
    
    // REDUCED: Fewer mountains to prevent excessive generation
    const mountainSpacing = 8; // Increased spacing
    const mountainCount = Math.ceil(CHUNK_SIZE / mountainSpacing);
    
    for (let i = 0; i < mountainCount; i++) {
      const z = chunkZ - (i * mountainSpacing);
      const mountainSeed = chunkId * 1000 + i * 73;
      
      // Left mountains positioned at X=-80
      const leftMountain = createMountain(-80, z, mountainSeed);
      if (leftMountain) {
        scene.add(leftMountain);
        mountains.push(leftMountain);
      }
      
      // Right mountains positioned at X=+80
      const rightMountain = createMountain(80, z, mountainSeed + 500);
      if (rightMountain) {
        scene.add(rightMountain);
        mountains.push(rightMountain);
      }
    }
    
    // REDUCED: Fewer trees to prevent excessive generation
    const treeCount = 4 + Math.floor(seededRandom(chunkId * 137) * 3); // Reduced from 6
    const minDistance = 4; // Increased minimum distance
    const maxAttempts = 30; // Reduced attempts
    const treePositions: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < treeCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, treeType, scale, rotation;
      
      while (!validPosition && attempts < maxAttempts) {
        const treeSeed = chunkId * 1000 + i * 73;
        
        x = (seededRandom(treeSeed) - 0.5) * 380;
        z = chunkZ + (seededRandom(treeSeed + 1) - 0.5) * CHUNK_SIZE * 0.9;
        
        if (!isWithinMountainBoundaries(x) || isOnPlayerPath(x)) {
          attempts++;
          continue;
        }
        
        validPosition = treePositions.every(pos => {
          const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
          return distance >= minDistance;
        });
        
        if (validPosition) {
          const distanceFromCenter = Math.abs(x);
          const typeRandom = seededRandom(treeSeed + 2);
          
          if (distanceFromCenter > 100) {
            treeType = typeRandom < 0.8 ? 'pine218' : 'stylized';
          } else {
            treeType = typeRandom < 0.6 ? 'pine218' : typeRandom < 0.8 ? 'stylized' : 'realistic';
          }
          
          const scaleConfig = TREE_SCALES[treeType];
          scale = scaleConfig.min + (seededRandom(treeSeed + 3) * (scaleConfig.max - scaleConfig.min));
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          treePositions.push({x, z});
        }
        
        attempts++;
      }
      
      if (validPosition && x !== undefined && z !== undefined) {
        const tree = await createTree(x, z, treeType, scale, rotation);
        if (tree) {
          scene.add(tree);
          trees.push(tree);
        }
      }
    }
    
    console.log(`Generated chunk ${chunkId} with ${mountains.length} mountains and ${trees.length} trees`);
    
    return {
      id: chunkId,
      z: chunkZ,
      mountains,
      trees
    };
  };

  // Cleanup a chunk (remove from scene and memory)
  const cleanupChunk = (chunk: EnvironmentChunk) => {
    chunk.mountains.forEach(mountain => scene.remove(mountain));
    chunk.trees.forEach(tree => scene.remove(tree));
    console.log(`Cleaned up chunk ${chunk.id}`);
  };

  // FIXED: Less aggressive chunk updates to prevent blinking
  const updateChunks = async (playerZ: number) => {
    const currentChunkId = Math.floor(-playerZ / CHUNK_SIZE);
    const chunksToGenerate = [];
    const chunksToKeep = [];
    
    // INCREASED: More chunks for continuous fantasy environment loading
    const startChunk = currentChunkId - 6; // Increased from 5 to 6
    const endChunk = currentChunkId + Math.ceil(RENDER_DISTANCE / CHUNK_SIZE) + 6; // Increased from 5 to 6
    
    for (let i = startChunk; i <= endChunk; i++) {
      if (!chunksRef.current.find(chunk => chunk.id === i)) {
        chunksToGenerate.push(i);
      }
    }
    
    // FIXED: Much more conservative cleanup distance
    chunksRef.current.forEach(chunk => {
      const distanceFromPlayer = Math.abs(chunk.z - playerZ);
      if (distanceFromPlayer <= CLEANUP_DISTANCE) {
        chunksToKeep.push(chunk);
      } else {
        cleanupChunk(chunk);
      }
    });
    
    // Generate new chunks
    for (const chunkId of chunksToGenerate) {
      const newChunk = await generateChunk(chunkId);
      chunksToKeep.push(newChunk);
    }
    
    chunksRef.current = chunksToKeep;
    setChunks([...chunksToKeep]);
  };

  // FIXED: Much less frequent updates to prevent blinking
  useFrame((state) => {
    const now = Date.now();
    
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
      return;
    }
    
    lastUpdateRef.current = now;
    
    playerPositionRef.current.copy(playerPosition);
    updateChunks(playerPositionRef.current.z);
  });

  // Initial chunk generation
  useEffect(() => {
    if (!mountainModel) return;
    
    TreeAssetManager.preloadAllModels().then(() => {
      console.log('Tree models preloaded, starting stable environment generation');
      updateChunks(0);
    });
    
    return () => {
      chunksRef.current.forEach(chunk => cleanupChunk(chunk));
      chunksRef.current = [];
    };
  }, [mountainModel]);

  return null;
};

// Preload the mountain model
useGLTF.preload('/assets/mountain_low_poly.glb');

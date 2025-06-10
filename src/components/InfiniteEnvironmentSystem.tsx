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

// ADJUSTED: Mountains much further from path to prevent clipping with wider path
const isWithinMountainBoundaries = (x: number): boolean => {
  return Math.abs(x) > 20 && Math.abs(x) < 200; // Increased buffer for wider path
};

// Ensure NO obstacles on the wider player path
const isOnPlayerPath = (x: number): boolean => {
  return Math.abs(x) < 18; // Increased for wider path
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
  
  const CHUNK_SIZE = 25;
  const RENDER_DISTANCE = 150; // Reduced for better performance
  const CLEANUP_DISTANCE = 250; // Reduced for better performance
  const UPDATE_INTERVAL = 150; // Increased interval for better performance

  // Create a mountain at specified position - OPTIMIZED for performance
  const createMountain = (x: number, z: number, seed: number): Group | null => {
    if (!mountainModel) return null;
    
    const mountain = mountainModel.clone() as Group;
    
    // REDUCED variations for better performance
    const offsetVariation = (seededRandom(seed) - 0.5) * 6;
    const scaleVariation = 0.06 + (seededRandom(seed + 1) * 0.06);
    const heightVariation = (seededRandom(seed + 2) - 0.5) * 3;
    const rotationVariation = seededRandom(seed + 3) * Math.PI * 0.2;
    
    // Apply positioning - mountains LOWERED into ground to prevent clipping
    mountain.position.set(
      x + offsetVariation, 
      -8 + heightVariation,
      z + (seededRandom(seed + 4) - 0.5) * 2
    );
    
    mountain.scale.set(
      x < 0 ? -scaleVariation : scaleVariation, 
      scaleVariation, 
      scaleVariation
    );
    mountain.rotation.y = rotationVariation;
    
    // OPTIMIZED: Disable shadows for performance
    mountain.castShadow = false;
    mountain.receiveShadow = false;
    mountain.matrixAutoUpdate = false; // Disable auto updates
    
    mountain.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = true; // Enable culling
      }
    });
    
    mountain.updateMatrixWorld(true);
    return mountain;
  };

  // OPTIMIZED: Create a tree with better performance
  const createTree = async (x: number, z: number, treeType: 'realistic' | 'stylized' | 'pine218', scale: number, rotation: number): Promise<Group | null> => {
    try {
      const treeModel = TreeAssetManager.getCachedModel(treeType);
      if (!treeModel) {
        console.warn(`Tree model ${treeType} not cached`);
        return null;
      }
      
      const tree = treeModel.clone() as Group;
      
      const groundHeight = getMountainSlopeHeight(x, z);
      const yPosition = groundHeight + TREE_Y_OFFSETS[treeType] - 1.8;
      
      tree.position.set(x, yPosition, z);
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = rotation;
      
      // OPTIMIZED: Disable expensive features for performance
      tree.castShadow = false;
      tree.receiveShadow = false;
      tree.frustumCulled = true;
      tree.matrixAutoUpdate = false;
      
      tree.traverse((child) => {
        if ((child as Mesh).isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          child.frustumCulled = true;
        }
      });
      
      tree.updateMatrixWorld(true);
      return tree;
    } catch (error) {
      console.error('Failed to create tree:', error);
      return null;
    }
  };

  // Generate a new environment chunk with REDUCED complexity for performance
  const generateChunk = async (chunkId: number): Promise<EnvironmentChunk> => {
    const chunkZ = -chunkId * CHUNK_SIZE;
    const mountains: Group[] = [];
    const trees: Group[] = [];
    
    // REDUCED mountain generation for performance
    const mountainSpacing = 4; // Increased spacing
    const mountainCount = Math.ceil(CHUNK_SIZE / mountainSpacing) + 2;
    
    for (let i = 0; i < mountainCount; i++) {
      const z = chunkZ - (i * mountainSpacing);
      const mountainSeed = chunkId * 1000 + i * 73;
      
      // Mountains positioned further from wider path
      const leftMountain = createMountain(-85, z, mountainSeed);
      if (leftMountain) {
        scene.add(leftMountain);
        mountains.push(leftMountain);
      }
      
      const rightMountain = createMountain(85, z, mountainSeed + 500);
      if (rightMountain) {
        scene.add(rightMountain);
        mountains.push(rightMountain);
      }
    }
    
    // REDUCED tree generation for 60fps performance
    const treeCount = 8 + Math.floor(seededRandom(chunkId * 137) * 4); // Reduced tree count
    const minDistance = 5; // Increased minimum distance
    const maxAttempts = 30; // Reduced attempts
    const treePositions: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < treeCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, treeType, scale, rotation;
      
      while (!validPosition && attempts < maxAttempts) {
        const treeSeed = chunkId * 1000 + i * 73;
        
        x = (seededRandom(treeSeed) - 0.5) * 340; // Adjusted for wider path
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
    
    console.log(`Generated optimized chunk ${chunkId} with ${mountains.length} mountains and ${trees.length} trees`);
    
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

  // Update chunks based on player position
  const updateChunks = async (playerZ: number) => {
    const currentChunkId = Math.floor(-playerZ / CHUNK_SIZE);
    const chunksToGenerate = [];
    const chunksToKeep = [];
    
    // Generate more chunks ahead and behind for seamless experience
    const startChunk = currentChunkId - 5; // More chunks behind
    const endChunk = currentChunkId + Math.ceil(RENDER_DISTANCE / CHUNK_SIZE) + 5; // More chunks ahead
    
    for (let i = startChunk; i <= endChunk; i++) {
      if (!chunksRef.current.find(chunk => chunk.id === i)) {
        chunksToGenerate.push(i);
      }
    }
    
    // Identify chunks to keep
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

  // OPTIMIZED: Track player position with reduced updates
  useFrame((state) => {
    const now = Date.now();
    
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
      return;
    }
    
    lastUpdateRef.current = now;
    
    playerPositionRef.current.copy(playerPosition);
    updateChunks(playerPositionRef.current.z);
  });

  // Initial chunk generation - OPTIMIZED for performance
  useEffect(() => {
    if (!mountainModel) return;
    
    TreeAssetManager.preloadAllModels().then(() => {
      console.log('Tree models preloaded, starting optimized environment generation');
      updateChunks(0);
    });
    
    return () => {
      chunksRef.current.forEach(chunk => cleanupChunk(chunk));
      chunksRef.current = [];
    };
  }, [mountainModel]);

  return null; // This component only manages the 3D objects, no visual component needed
};

// Preload the mountain model
useGLTF.preload('/assets/mountain_low_poly.glb');

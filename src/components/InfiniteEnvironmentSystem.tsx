
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

// ADJUSTED: Mountains closer to path but still providing a valley corridor
const isWithinMountainBoundaries = (x: number): boolean => {
  // Trees can spawn between mountains, closer to the path
  return Math.abs(x) > 30 && Math.abs(x) < 45; // Narrower band, closer to path
};

// Ensure NO obstacles on the main player path
const isOnPlayerPath = (x: number): boolean => {
  return Math.abs(x) < 15; // Slightly narrower safety zone around path center
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
  const RENDER_DISTANCE = 150;
  const CLEANUP_DISTANCE = 200;
  const UPDATE_INTERVAL = 100;

  // Create a mountain at specified position - CLOSER to path, parallel alignment
  const createMountain = (x: number, z: number, seed: number): Group | null => {
    if (!mountainModel) return null;
    
    const mountain = mountainModel.clone() as Group;
    
    // Enhanced variations for natural appearance
    const offsetVariation = (seededRandom(seed) - 0.5) * 8; // Reduced variation
    const scaleVariation = 0.06 + (seededRandom(seed + 1) * 0.08);
    const heightVariation = (seededRandom(seed + 2) - 0.5) * 4;
    // Align rotation to be more parallel to path (Z-axis)
    const rotationVariation = seededRandom(seed + 3) * Math.PI * 0.3; // Reduced rotation for better alignment
    
    // Apply positioning - mountains closer to path but still creating a valley
    mountain.position.set(
      x + offsetVariation, 
      heightVariation, 
      z + (seededRandom(seed + 4) - 0.5) * 3 // Reduced Z variation for better parallel alignment
    );
    
    mountain.scale.set(
      x < 0 ? -scaleVariation : scaleVariation, 
      scaleVariation, 
      scaleVariation
    );
    mountain.rotation.y = rotationVariation;
    
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    
    mountain.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return mountain;
  };

  // Create a tree at specified position
  const createTree = async (x: number, z: number, treeType: 'realistic' | 'stylized' | 'pine218', scale: number, rotation: number): Promise<Group | null> => {
    try {
      const treeModel = TreeAssetManager.getCachedModel(treeType);
      if (!treeModel) {
        console.warn(`Tree model ${treeType} not cached`);
        return null;
      }
      
      const tree = treeModel.clone() as Group;
      tree.position.set(x, TREE_Y_OFFSETS[treeType], z);
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = rotation;
      tree.castShadow = true;
      tree.receiveShadow = true;
      
      tree.traverse((child) => {
        if ((child as Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      return tree;
    } catch (error) {
      console.error('Failed to create tree:', error);
      return null;
    }
  };

  // Generate a new environment chunk
  const generateChunk = async (chunkId: number): Promise<EnvironmentChunk> => {
    const chunkZ = -chunkId * CHUNK_SIZE;
    const mountains: Group[] = [];
    const trees: Group[] = [];
    
    // Generate mountains CLOSER to the path - create a narrower valley
    const mountainSpacing = 3; // Closer spacing for better continuity
    const mountainCount = Math.ceil(CHUNK_SIZE / mountainSpacing) + 3; // More mountains for continuity
    
    for (let i = 0; i < mountainCount; i++) {
      const z = chunkZ - (i * mountainSpacing);
      const mountainSeed = chunkId * 1000 + i * 73;
      
      // Left mountains positioned at X=-50 (MUCH closer than before)
      const leftMountain = createMountain(-50, z, mountainSeed);
      if (leftMountain) {
        scene.add(leftMountain);
        mountains.push(leftMountain);
      }
      
      // Right mountains positioned at X=+50 (MUCH closer than before)
      const rightMountain = createMountain(50, z, mountainSeed + 500);
      if (rightMountain) {
        scene.add(rightMountain);
        mountains.push(rightMountain);
      }
    }
    
    // Generate trees in the space between closer mountains
    const treeCount = 5 + Math.floor(seededRandom(chunkId * 137) * 3); // Fewer trees due to less space
    const minDistance = 4; // Reduced minimum distance
    const maxAttempts = 30;
    const treePositions: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < treeCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, treeType, scale, rotation;
      
      while (!validPosition && attempts < maxAttempts) {
        const treeSeed = chunkId * 1000 + i * 73;
        
        // Position trees in the narrower mountain boundary areas
        x = (seededRandom(treeSeed) - 0.5) * 90; // Spread to ±45 units
        z = chunkZ + (seededRandom(treeSeed + 1) - 0.5) * CHUNK_SIZE * 0.8;
        
        // STRICT boundary checks - NO trees near the path
        if (!isWithinMountainBoundaries(x) || isOnPlayerPath(x)) {
          attempts++;
          continue;
        }
        
        // Additional safety - ensure trees are in the outer bands only
        const distanceFromCenter = Math.abs(x);
        if (distanceFromCenter < 30) { // Must be at least 30 units from center (reduced from 100)
          attempts++;
          continue;
        }
        
        // Check distance from existing trees
        validPosition = treePositions.every(pos => {
          const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
          return distance >= minDistance;
        });
        
        if (validPosition) {
          // Determine tree type
          const typeRandom = seededRandom(treeSeed + 2);
          treeType = typeRandom < 0.6 ? 'pine218' : typeRandom < 0.8 ? 'stylized' : 'realistic';
          
          // Get scale and rotation
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
    
    console.log(`Generated chunk ${chunkId} with ${mountains.length} mountains at ±50 units (closer to path) and ${trees.length} trees`);
    
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
    
    // Determine which chunks should exist - generate more for continuity
    const startChunk = currentChunkId - 3;
    const endChunk = currentChunkId + Math.ceil(RENDER_DISTANCE / CHUNK_SIZE) + 2;
    
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

  // Track player position and manage chunks with throttling
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
      console.log('Tree models preloaded, starting wide valley generation with mountains at ±140');
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

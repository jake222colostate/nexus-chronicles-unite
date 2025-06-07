import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Mesh, Vector3 } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { TreeAssetManager, TREE_SCALES, TREE_Y_OFFSETS } from './TreeAssetManager';

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

// Check if position is within mountain boundaries (between -25 and 25 X, avoiding mountains)
const isWithinMountainBoundaries = (x: number): boolean => {
  return Math.abs(x) < 20; // Keep trees within ±20 units to avoid mountain overlap
};

// Check if position is on player path
const isOnPlayerPath = (x: number): boolean => {
  return Math.abs(x) < 4; // 4 unit buffer around path center
};

export const InfiniteEnvironmentSystem: React.FC = () => {
  const { scene } = useThree();
  const { scene: mountainModel } = useGLTF('/assets/mountain_low_poly.glb');
  const [chunks, setChunks] = useState<EnvironmentChunk[]>([]);
  const chunksRef = useRef<EnvironmentChunk[]>([]);
  const playerPositionRef = useRef(new Vector3(0, 0, 0));
  
  const CHUNK_SIZE = 40; // Size of each environment chunk
  const RENDER_DISTANCE = 150; // How far ahead to generate
  const CLEANUP_DISTANCE = 200; // How far behind to cleanup

  // Create a mountain at specified position
  const createMountain = (x: number, z: number, scale: number = 0.08): Group | null => {
    if (!mountainModel) return null;
    
    const mountain = mountainModel.clone() as Group;
    mountain.position.set(x, 0, z);
    mountain.scale.set(x < 0 ? -scale : scale, scale, scale); // Mirror left side mountains
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
    
    // Generate mountains for this chunk
    const mountainCount = Math.floor(CHUNK_SIZE / 8); // One mountain every 8 units
    for (let i = 0; i < mountainCount; i++) {
      const z = chunkZ - (i * 8);
      
      // Left mountain
      const leftMountain = createMountain(-25, z);
      if (leftMountain) {
        scene.add(leftMountain);
        mountains.push(leftMountain);
      }
      
      // Right mountain
      const rightMountain = createMountain(25, z);
      if (rightMountain) {
        scene.add(rightMountain);
        mountains.push(rightMountain);
      }
    }
    
    // Generate trees for this chunk (constrained within mountain boundaries)
    const treeCount = 8 + Math.floor(seededRandom(chunkId * 137) * 6); // 8-14 trees per chunk
    const minDistance = 4; // Minimum distance between trees
    const maxAttempts = 30;
    const treePositions: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < treeCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, treeType, scale, rotation;
      
      while (!validPosition && attempts < maxAttempts) {
        const treeSeed = chunkId * 1000 + i * 73;
        
        // Position within chunk bounds and mountain boundaries
        x = (seededRandom(treeSeed) - 0.5) * 35; // Spread across ±17.5 units
        z = chunkZ + (seededRandom(treeSeed + 1) - 0.5) * CHUNK_SIZE * 0.8;
        
        // Check boundaries
        if (!isWithinMountainBoundaries(x) || isOnPlayerPath(x, z)) {
          attempts++;
          continue;
        }
        
        // Check distance from existing trees
        validPosition = treePositions.every(pos => {
          const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
          return distance >= minDistance;
        });
        
        if (validPosition) {
          // Determine tree type (favoring pine218)
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

  // Update chunks based on player position
  const updateChunks = async (playerZ: number) => {
    const currentChunkId = Math.floor(-playerZ / CHUNK_SIZE);
    const chunksToGenerate = [];
    const chunksToKeep = [];
    
    // Determine which chunks should exist
    const startChunk = currentChunkId - 1; // One behind
    const endChunk = currentChunkId + Math.ceil(RENDER_DISTANCE / CHUNK_SIZE); // Several ahead
    
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

  // Track player position and manage chunks
  useFrame(() => {
    // For now, assume player moves forward automatically
    // In a real game, you'd get this from your player controller
    playerPositionRef.current.z -= 0.1; // Simulate forward movement
    
    // Update chunks every frame (you might want to throttle this)
    updateChunks(playerPositionRef.current.z);
  });

  // Initial chunk generation
  useEffect(() => {
    if (!mountainModel) return;
    
    // Preload tree models
    TreeAssetManager.preloadAllModels().then(() => {
      console.log('Tree models preloaded, starting chunk generation');
      updateChunks(0);
    });
    
    return () => {
      // Cleanup all chunks on unmount
      chunksRef.current.forEach(chunk => cleanupChunk(chunk));
      chunksRef.current = [];
    };
  }, [mountainModel]);

  return null; // This component only manages the 3D objects, no visual component needed
};

// Preload the mountain model
useGLTF.preload('/assets/mountain_low_poly.glb');

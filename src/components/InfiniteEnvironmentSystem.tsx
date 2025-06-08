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

// Check if position is within mountain boundaries (between left and right mountains)
const isWithinMountainBoundaries = (x: number): boolean => {
  return Math.abs(x) < 110; // Keep trees within ±110 units to avoid mountain overlap at ±130
};

// Check if position is on player path
const isOnPlayerPath = (x: number): boolean => {
  return Math.abs(x) < 6; // Increased buffer around path center for safety
};

export const InfiniteEnvironmentSystem: React.FC = () => {
  const { scene } = useThree();
  const { scene: mountainModel } = useGLTF('/assets/mountain_low_poly.glb');
  const [chunks, setChunks] = useState<EnvironmentChunk[]>([]);
  const chunksRef = useRef<EnvironmentChunk[]>([]);
  const playerPositionRef = useRef(new Vector3(0, 0, 0));
  
  const CHUNK_SIZE = 30; // Reduced chunk size for denser mountain placement
  const RENDER_DISTANCE = 120; // How far ahead to generate
  const CLEANUP_DISTANCE = 150; // How far behind to cleanup

  // Create a mountain at specified position with enhanced jagged variations
  const createMountain = (x: number, z: number, seed: number): Group | null => {
    if (!mountainModel) return null;
    
    const mountain = mountainModel.clone() as Group;
    
    // Enhanced jagged variations using seed for more natural appearance
    const offsetVariation = (seededRandom(seed) - 0.5) * 8; // Increased to ±4 units random offset
    const scaleVariation = 0.06 + (seededRandom(seed + 1) * 0.08); // Increased variation: 0.06-0.14 scale
    const heightVariation = (seededRandom(seed + 2) - 0.5) * 4; // Increased to ±2 unit height variation
    const rotationVariation = seededRandom(seed + 3) * Math.PI * 0.6; // Increased to ±54° rotation
    
    // Apply enhanced jagged positioning
    mountain.position.set(
      x + offsetVariation, 
      heightVariation, 
      z + (seededRandom(seed + 4) - 0.5) * 4 // Increased Z-axis jitter for more irregular spacing
    );
    
    // Apply more varied scaling and rotation for jagged appearance
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
    
    // Generate mountains for this chunk - ultra-wide separation
    const mountainSpacing = 5; // Reduced spacing for continuous coverage
    const mountainCount = Math.ceil(CHUNK_SIZE / mountainSpacing) + 1; // +1 for overlap
    
    for (let i = 0; i < mountainCount; i++) {
      const z = chunkZ - (i * mountainSpacing);
      const mountainSeed = chunkId * 1000 + i * 73;
      
      // Left mountains (ultra-wide separation - moved from -100 to -130)
      const leftMountain = createMountain(-130, z, mountainSeed);
      if (leftMountain) {
        scene.add(leftMountain);
        mountains.push(leftMountain);
      }
      
      // Right mountains (ultra-wide separation - moved from 100 to 130)
      const rightMountain = createMountain(130, z, mountainSeed + 500);
      if (rightMountain) {
        scene.add(rightMountain);
        mountains.push(rightMountain);
      }
    }
    
    // Generate trees for this chunk (constrained within mountain boundaries)
    const treeCount = 6 + Math.floor(seededRandom(chunkId * 137) * 4); // 6-10 trees per chunk
    const minDistance = 3.5; // Minimum distance between trees
    const maxAttempts = 25;
    const treePositions: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < treeCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, treeType, scale, rotation;
      
      while (!validPosition && attempts < maxAttempts) {
        const treeSeed = chunkId * 1000 + i * 73;
        
        // Position within chunk bounds and mountain boundaries - ultra-wide distribution
        x = (seededRandom(treeSeed) - 0.5) * 160; // Increased spread to ±80 units for ultra-wide tree distribution
        z = chunkZ + (seededRandom(treeSeed + 1) - 0.5) * CHUNK_SIZE * 0.8;
        
        // Check boundaries
        if (!isWithinMountainBoundaries(x) || isOnPlayerPath(x)) {
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
    
    console.log(`Generated chunk ${chunkId} with ${mountains.length} ultra-wide separated jagged mountains at ±130 units and ${trees.length} trees`);
    
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
    
    // Determine which chunks should exist - generate more overlap for continuity
    const startChunk = currentChunkId - 2; // Two behind for better continuity
    const endChunk = currentChunkId + Math.ceil(RENDER_DISTANCE / CHUNK_SIZE) + 1; // Extra ahead
    
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
      console.log('Tree models preloaded, starting continuous jagged mountain generation');
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


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
// Mountains now sit closer to the player path so clamp tree generation tighter
const isWithinMountainBoundaries = (x: number): boolean => {
  // Keep trees within ±50 units to avoid overlap with mountains positioned at ±60
  return Math.abs(x) < 50;
};

// Check if position is on player path
const isOnPlayerPath = (x: number): boolean => {
  return Math.abs(x) < 8; // Increased buffer around path center for safety
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
  
  const CHUNK_SIZE = 25; // Smaller chunks for more continuous generation
  const RENDER_DISTANCE = 150; // Increased render distance
  const CLEANUP_DISTANCE = 200; // Increased cleanup distance
  const UPDATE_INTERVAL = 100; // Update every 100ms instead of every frame

  // Create a mountain at specified position with enhanced jagged variations
  const createMountain = (x: number, z: number, seed: number): Group | null => {
    if (!mountainModel) return null;
    
    const mountain = mountainModel.clone() as Group;
    
    // Enhanced jagged variations using seed for more natural appearance
    const offsetVariation = (seededRandom(seed) - 0.5) * 10; // Increased to ±5 units random offset
    const scaleVariation = 0.05 + (seededRandom(seed + 1) * 0.1); // Increased variation: 0.05-0.15 scale
    const heightVariation = (seededRandom(seed + 2) - 0.5) * 6; // Increased to ±3 unit height variation
    const rotationVariation = seededRandom(seed + 3) * Math.PI * 0.8; // Increased to ±72° rotation
    
    // Apply enhanced jagged positioning
    mountain.position.set(
      x + offsetVariation, 
      heightVariation, 
      z + (seededRandom(seed + 4) - 0.5) * 5 // Increased Z-axis jitter for more irregular spacing
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
    
    // Generate mountains for this chunk - maximum separation
    const mountainSpacing = 4; // Reduced spacing for even more continuous coverage
    const mountainCount = Math.ceil(CHUNK_SIZE / mountainSpacing) + 2; // +2 for better overlap
    
    for (let i = 0; i < mountainCount; i++) {
      const z = chunkZ - (i * mountainSpacing);
      const mountainSeed = chunkId * 1000 + i * 73;
      
      // Left mountains positioned closer to the path
      const leftMountain = createMountain(-60, z, mountainSeed);
      if (leftMountain) {
        scene.add(leftMountain);
        mountains.push(leftMountain);
      }
      
      // Right mountains positioned closer to the path
      const rightMountain = createMountain(60, z, mountainSeed + 500);
      if (rightMountain) {
        scene.add(rightMountain);
        mountains.push(rightMountain);
      }
    }
    
    // Generate trees for this chunk (constrained within mountain boundaries)
    const treeCount = 8 + Math.floor(seededRandom(chunkId * 137) * 5); // 8-12 trees per chunk
    const minDistance = 4; // Minimum distance between trees
    const maxAttempts = 30;
    const treePositions: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < treeCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, treeType, scale, rotation;
      
      while (!validPosition && attempts < maxAttempts) {
        const treeSeed = chunkId * 1000 + i * 73;
        
        // Position within chunk bounds and mountain boundaries - strict boundary checking
        x = (seededRandom(treeSeed) - 0.5) * 180; // Spread to ±90 units but check boundaries
        z = chunkZ + (seededRandom(treeSeed + 1) - 0.5) * CHUNK_SIZE * 0.8;
        
        // Strict boundary checks - ensure trees don't spawn in mountains
        if (!isWithinMountainBoundaries(x) || isOnPlayerPath(x)) {
          attempts++;
          continue;
        }
        
        // Additional safety check - ensure trees are not too close to mountain positions
        const leftMountainDistance = Math.abs(x - (-60));
        const rightMountainDistance = Math.abs(x - 60);
        if (leftMountainDistance < 20 || rightMountainDistance < 20) {
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
    
    console.log(`Generated chunk ${chunkId} with ${mountains.length} mountains at ±60 units and ${trees.length} trees`);
    
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
    const startChunk = currentChunkId - 3; // Three behind for better continuity
    const endChunk = currentChunkId + Math.ceil(RENDER_DISTANCE / CHUNK_SIZE) + 2; // Extra ahead
    
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
    
    // Throttle updates to prevent infinite loops
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
      return;
    }
    
    lastUpdateRef.current = now;
    
    playerPositionRef.current.copy(playerPosition);

    // Update chunks with throttling
    updateChunks(playerPositionRef.current.z);
  });

  // Initial chunk generation
  useEffect(() => {
    if (!mountainModel) return;
    
    // Preload tree models
    TreeAssetManager.preloadAllModels().then(() => {
      console.log('Tree models preloaded, starting continuous mountain generation');
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

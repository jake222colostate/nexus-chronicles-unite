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

// OPTIMIZED mountain slope calculation
const getMountainSlopeHeight = (x: number, z: number): number => {
  const distanceFromCenter = Math.abs(x);
  
  if (distanceFromCenter < 15) {
    return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5;
  }
  
  const slopeDistance = distanceFromCenter - 15;
  const mountainHeight = slopeDistance * 0.1;
  
  return Math.max(0, mountainHeight);
};

// PERFORMANCE: Simplified boundary checks
const isWithinMountainBoundaries = (x: number): boolean => {
  return Math.abs(x) > 15 && Math.abs(x) < 150; // Reduced range
};

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
  
  const CHUNK_SIZE = 30; // Increased for fewer chunks
  const RENDER_DISTANCE = 120; // Reduced for better performance
  const CLEANUP_DISTANCE = 180; // Reduced cleanup distance
  const UPDATE_INTERVAL = 200; // Less frequent updates

  // PERFORMANCE: Optimized mountain creation
  const createMountain = (x: number, z: number, seed: number): Group | null => {
    if (!mountainModel) return null;
    
    const mountain = mountainModel.clone() as Group;
    
    // Simplified variations
    const offsetVariation = (seededRandom(seed) - 0.5) * 4; // Reduced
    const scaleVariation = 0.05 + (seededRandom(seed + 1) * 0.04); // Reduced
    const heightVariation = (seededRandom(seed + 2) - 0.5) * 2; // Reduced
    const rotationVariation = seededRandom(seed + 3) * Math.PI * 0.2; // Reduced
    
    mountain.position.set(
      x + offsetVariation, 
      -10 + heightVariation, // Lower for better performance
      z
    );
    
    mountain.scale.set(
      x < 0 ? -scaleVariation : scaleVariation, 
      scaleVariation, 
      scaleVariation
    );
    mountain.rotation.y = rotationVariation;
    
    // PERFORMANCE: Disable shadows on mountains
    mountain.castShadow = false;
    mountain.receiveShadow = false;
    
    mountain.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = true; // Enable culling
      }
    });
    
    return mountain;
  };

  // PERFORMANCE: Simplified tree creation
  const createTree = async (x: number, z: number, treeType: 'realistic' | 'stylized' | 'pine218', scale: number, rotation: number): Promise<Group | null> => {
    try {
      const treeModel = TreeAssetManager.getCachedModel(treeType);
      if (!treeModel) {
        return null; // Skip if not loaded
      }
      
      const tree = treeModel.clone() as Group;
      
      const groundHeight = getMountainSlopeHeight(x, z);
      const yPosition = groundHeight + TREE_Y_OFFSETS[treeType] - 1.8;
      
      tree.position.set(x, yPosition, z);
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = rotation;
      
      // PERFORMANCE: Disable shadows on trees
      tree.castShadow = false;
      tree.receiveShadow = false;
      tree.frustumCulled = true; // Enable culling
      
      tree.traverse((child) => {
        if ((child as Mesh).isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          child.frustumCulled = true;
        }
      });
      
      return tree;
    } catch (error) {
      return null; // Skip problematic trees
    }
  };

  // PERFORMANCE: Reduced chunk generation complexity
  const generateChunk = async (chunkId: number): Promise<EnvironmentChunk> => {
    const chunkZ = -chunkId * CHUNK_SIZE;
    const mountains: Group[] = [];
    const trees: Group[] = [];
    
    // PERFORMANCE: Fewer mountains with more spacing
    const mountainSpacing = 5; // Increased spacing
    const mountainCount = Math.ceil(CHUNK_SIZE / mountainSpacing) + 1;
    
    for (let i = 0; i < mountainCount; i++) {
      const z = chunkZ - (i * mountainSpacing);
      const mountainSeed = chunkId * 1000 + i * 73;
      
      // Only create mountains if close enough to player
      const distanceToPlayer = Math.abs(z - playerPosition.z);
      if (distanceToPlayer < RENDER_DISTANCE) {
        const leftMountain = createMountain(-80, z, mountainSeed);
        if (leftMountain) {
          scene.add(leftMountain);
          mountains.push(leftMountain);
        }
        
        const rightMountain = createMountain(80, z, mountainSeed + 500);
        if (rightMountain) {
          scene.add(rightMountain);
          mountains.push(rightMountain);
        }
      }
    }
    
    // PERFORMANCE: Fewer trees
    const treeCount = 6 + Math.floor(seededRandom(chunkId * 137) * 4); // Reduced
    const minDistance = 5; // Increased for performance
    const maxAttempts = 20; // Reduced attempts
    const treePositions: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < treeCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, treeType, scale, rotation;
      
      while (!validPosition && attempts < maxAttempts) {
        const treeSeed = chunkId * 1000 + i * 73;
        
        x = (seededRandom(treeSeed) - 0.5) * 280; // Reduced range
        z = chunkZ + (seededRandom(treeSeed + 1) - 0.5) * CHUNK_SIZE * 0.8;
        
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
          
          // Favor pine218 for better performance
          treeType = typeRandom < 0.85 ? 'pine218' : 'stylized';
          
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
  };

  // Update chunks based on player position
  const updateChunks = async (playerZ: number) => {
    const currentChunkId = Math.floor(-playerZ / CHUNK_SIZE);
    const chunksToGenerate = [];
    const chunksToKeep = [];
    
    // PERFORMANCE: Generate fewer chunks
    const startChunk = currentChunkId - 2; // Reduced
    const endChunk = currentChunkId + Math.ceil(RENDER_DISTANCE / CHUNK_SIZE) + 2; // Reduced
    
    for (let i = startChunk; i <= endChunk; i++) {
      if (!chunksRef.current.find(chunk => chunk.id === i)) {
        chunksToGenerate.push(i);
      }
    }
    
    chunksRef.current.forEach(chunk => {
      const distanceFromPlayer = Math.abs(chunk.z - playerZ);
      if (distanceFromPlayer <= CLEANUP_DISTANCE) {
        chunksToKeep.push(chunk);
      } else {
        cleanupChunk(chunk);
      }
    });
    
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
      console.log('Optimized tree models loaded, starting performance-focused generation');
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

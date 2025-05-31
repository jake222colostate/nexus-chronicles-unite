
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_TREE_URL = 'https://raw.githubusercontent.com/jake222colostate/HIGHPOLY/main/fantasy_tree.glb';

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Fallback tree component using basic geometry
const FallbackTree: React.FC<{ position: [number, number, number]; scale: number; rotation: number }> = ({
  position,
  scale,
  rotation
}) => {
  return (
    <group
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, rotation, 0]}
    >
      {/* Tree trunk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.15, 1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Tree foliage */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.8, 1.5, 8]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshLambertMaterial color="#32CD32" />
      </mesh>
    </group>
  );
};

// Individual tree component with proper GLB handling and fallback
const FantasyTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  rotation: number;
  useFallback: boolean;
}> = ({ position, scale, rotation, useFallback }) => {
  
  if (useFallback) {
    return <FallbackTree position={position} scale={scale} rotation={rotation} />;
  }

  try {
    const { scene } = useGLTF(FANTASY_TREE_URL);
    
    if (!scene) {
      console.warn('Fantasy tree scene not loaded, using fallback');
      return <FallbackTree position={position} scale={scale} rotation={rotation} />;
    }

    console.log('Fantasy tree loaded successfully - Position:', position);
    
    // Clone the scene to avoid sharing geometry between instances
    const clonedScene = scene.clone();
    
    // Ensure all meshes in the scene have proper materials and shadows
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
    
    return (
      <group
        position={position}
        scale={[scale, scale, scale]}
        rotation={[0, rotation, 0]}
      >
        <primitive 
          object={clonedScene} 
          castShadow 
          receiveShadow 
        />
      </group>
    );
  } catch (error) {
    console.error('Failed to load fantasy tree model, using fallback:', error);
    return <FallbackTree position={position} scale={scale} rotation={rotation} />;
  }
};

interface FantasyTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyTreeSystem: React.FC<FantasyTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const [modelLoadFailed, setModelLoadFailed] = useState(false);
  const loadAttempted = useRef(false);

  console.log('FantasyTreeSystem render - Realm:', realm, 'Chunks:', chunks.length);

  // Test model loading on mount
  useEffect(() => {
    if (!loadAttempted.current && realm === 'fantasy') {
      loadAttempted.current = true;
      
      const testLoad = async () => {
        try {
          console.log('FantasyTreeSystem: Testing tree model load...');
          const response = await fetch(FANTASY_TREE_URL);
          if (!response.ok) {
            console.error('FantasyTreeSystem: Tree model URL not accessible:', response.status);
            setModelLoadFailed(true);
          } else {
            console.log('FantasyTreeSystem: Tree model URL is accessible');
          }
        } catch (error) {
          console.error('FantasyTreeSystem: Tree model URL test failed:', error);
          setModelLoadFailed(true);
        }
      };
      
      testLoad();
    }
  }, [realm]);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyTreeSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate tree positions for each chunk
  const treePositions = useMemo(() => {
    console.log('Generating tree positions for', chunks.length, 'chunks');
    const positions = [];
    const minDistance = 6; // Minimum distance between trees
    const maxAttempts = 25;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 3-5 trees per chunk in clusters
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 73;
          
          // Position trees on both sides of the path, avoiding the road area
          const side = seededRandom(treeSeed + 10) > 0.5 ? 1 : -1;
          x = worldX + side * (8 + seededRandom(treeSeed) * 15); // Keep trees away from road
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.7;
          
          // Varied scale and rotation for natural look (scale between 1.0 and 1.2)
          scale = 1.0 + seededRandom(treeSeed + 2) * 0.2;
          rotation = seededRandom(treeSeed + 3) * Math.PI * 2;
          
          // Check distance from existing trees
          validPosition = true;
          for (const existing of positions) {
            const distance = Math.sqrt(
              Math.pow(x - existing.x, 2) + Math.pow(z - existing.z, 2)
            );
            if (distance < minDistance) {
              validPosition = false;
              break;
            }
          }
          
          attempts++;
        }
        
        if (validPosition) {
          positions.push({ x, z, scale, rotation, chunkId: chunk.id });
          console.log(`Tree ${i} placed at (${x.toFixed(2)}, ${z.toFixed(2)}) with scale ${scale.toFixed(2)}`);
        } else {
          console.warn(`Failed to place tree ${i} in chunk ${chunk.id} after ${maxAttempts} attempts`);
        }
      }
    });
    
    console.log(`Total fantasy trees generated: ${positions.length}`);
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {treePositions.map((pos, index) => {
        console.log(`Rendering fantasy tree ${index} at position:`, [pos.x, 0, pos.z]);
        return (
          <FantasyTree
            key={`fantasy-tree-${pos.chunkId}-${index}`}
            position={[pos.x, 0, pos.z]}
            scale={pos.scale}
            rotation={pos.rotation}
            useFallback={modelLoadFailed}
          />
        );
      })}
    </group>
  );
};

// Preload the model for better performance
console.log('Attempting to preload fantasy tree model:', FANTASY_TREE_URL);
try {
  useGLTF.preload(FANTASY_TREE_URL);
} catch (error) {
  console.warn('Failed to preload fantasy tree model, will use fallback trees:', error);
}

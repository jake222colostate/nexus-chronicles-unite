import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_TREE_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_tree_draco.glb';

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Fallback tree component using basic geometry
const FallbackTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  rotation: number;
}> = ({ position, scale, rotation }) => {
  return (
    <group
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, rotation, 0]}
    >
      {/* Tree trunk */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.6]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Tree foliage - multiple layers for depth */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.2, 2, 8]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.9, 1.5, 8]} />
        <meshLambertMaterial color="#32CD32" />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 1, 8]} />
        <meshLambertMaterial color="#90EE90" />
      </mesh>
    </group>
  );
};

// Individual tree component with proper GLB handling and fallback
const FantasyTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  rotation: number;
}> = ({ position, scale, rotation }) => {
  
  try {
    const { scene } = useGLTF(FANTASY_TREE_URL);
    
    if (!scene) {
      console.warn('Draco-compressed fantasy tree scene not loaded, using fallback');
      return <FallbackTree position={position} scale={scale} rotation={rotation} />;
    }

    console.log('Draco-compressed fantasy tree loaded successfully - Position:', position);
    
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
    console.error('Failed to load Draco-compressed fantasy tree model, using fallback:', error);
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
  console.log('FantasyTreeSystem render - Realm:', realm, 'Chunks:', chunks.length);

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
      
      // Generate 3-5 trees per chunk in clusters within X-range ±30
      const treeCount = 3 + Math.floor(seededRandom(seed) * 3);
      console.log(`Chunk ${chunk.id}: generating ${treeCount} trees at world position (${worldX}, ${worldZ})`);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale, rotation;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 73;
          
          // Position trees randomly within ±30 range near the road
          x = worldX + (seededRandom(treeSeed) - 0.5) * 60; // ±30 range
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.7;
          
          // Varied scale and rotation for natural look
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
          <Suspense key={`fantasy-tree-${pos.chunkId}-${index}`} fallback={null}>
            <FantasyTree
              position={[pos.x, 0, pos.z]}
              scale={pos.scale}
              rotation={pos.rotation}
            />
          </Suspense>
        );
      })}
    </group>
  );
};

// Preload the Draco-compressed model
useGLTF.preload(FANTASY_TREE_URL);
console.log('FantasyTreeSystem: Preloading Draco-compressed tree model');

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface GLBMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm?: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const GLBMountainSystem: React.FC<GLBMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm = 'fantasy'
}) => {
  const gltf = useGLTF('/newassets/Mountain.glb');
  const scene = gltf.scene;

  const shouldRender = realm === 'fantasy';
  
  // Memoize mountain instances to prevent re-creation on every render
  const mountainInstances = useMemo(() => {
    if (!shouldRender) return [];
    
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // 60fps optimization - fewer mountains
      const mountainSpacing = 25; // Increased spacing for 60fps
      const mountainCount = Math.ceil(chunkSize / mountainSpacing) + 1; // Reduced overlap
      
      for (let i = 0; i < mountainCount; i++) {
        const mountainSeed = seed + i * 67;
        const z = worldZ - (i * mountainSpacing) + seededRandom(mountainSeed) * 10;
        
        // Left side mountains - further from path
        const leftX = -80 - seededRandom(mountainSeed + 1) * 30;
        const leftY = seededRandom(mountainSeed + 2) * 2;
        
        const leftRotationX = (seededRandom(mountainSeed + 3) - 0.5) * 0.4;
        const leftRotationY = seededRandom(mountainSeed + 4) * Math.PI * 2;
        const leftRotationZ = (seededRandom(mountainSeed + 5) - 0.5) * 0.2;
        const leftScale = (1.2 + seededRandom(mountainSeed + 6) * 0.8) * 3;
        
        instances.push({
          key: `left_${chunk.id}_${i}`,
          position: [leftX, leftY, z] as [number, number, number],
          rotation: [leftRotationX, leftRotationY, leftRotationZ] as [number, number, number],
          scale: [leftScale, leftScale, leftScale] as [number, number, number]
        });
        
        // Right side mountains - further from path  
        const rightSeed = mountainSeed + 1000;
        const rightX = 80 + seededRandom(rightSeed + 1) * 30;
        const rightY = seededRandom(rightSeed + 2) * 2;
        
        const rightRotationX = (seededRandom(rightSeed + 3) - 0.5) * 0.4;
        const rightRotationY = seededRandom(rightSeed + 4) * Math.PI * 2;
        const rightRotationZ = (seededRandom(rightSeed + 5) - 0.5) * 0.2;
        const rightScale = (1.2 + seededRandom(rightSeed + 6) * 0.8) * 3;
        
        instances.push({
          key: `right_${chunk.id}_${i}`,
          position: [rightX, rightY, z] as [number, number, number],
          rotation: [rightRotationX, rightRotationY, rightRotationZ] as [number, number, number],
          scale: [rightScale, rightScale, rightScale] as [number, number, number]
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize, scene, shouldRender]);

  const mountainElements = useMemo(() => {
    if (!shouldRender) return [];

    return mountainInstances.map((instance) => {
      const clonedScene = scene.clone();

      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Completely remove tree meshes from Fantasy realm
          if (realm === 'fantasy') {
              const isTree = child.name.toLowerCase().includes('tree') || 
                           child.name.toLowerCase().includes('forest') ||
                           child.name.toLowerCase().includes('vegetation') ||
                           child.name.toLowerCase().includes('foliage') ||
                           child.name.toLowerCase().includes('leaves') ||
                           child.name.toLowerCase().includes('branch') ||
                           (child.material && child.material.name && 
                            (child.material.name.toLowerCase().includes('tree') ||
                             child.material.name.toLowerCase().includes('leaf') ||
                             child.material.name.toLowerCase().includes('bark') ||
                             child.material.name.toLowerCase().includes('foliage')));
              
              if (isTree) {
                // Remove the mesh completely from the parent
                if (child.parent) {
                  child.parent.remove(child);
                }
                return;
              }
            }
            
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.material) {
              child.material.needsUpdate = false;
            }
          }
        });
        
      return (
        <primitive
          key={instance.key}
          object={clonedScene}
          position={instance.position}
          rotation={instance.rotation}
          scale={instance.scale}
        />
      );
    });
  }, [mountainInstances, scene, realm, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return <group>{mountainElements}</group>;
};

// Preload the local mountain model for fantasy realm
if (typeof window !== 'undefined') {
  useGLTF.preload('/newassets/Mountain.glb');
  console.log('GLBMountainSystem: Preloading local mountain model');
}


import React, { useMemo, useRef } from 'react';
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
  // Only load GLB model if in fantasy realm
  const shouldLoadModel = realm === 'fantasy';
  
  let scene = null;
  if (shouldLoadModel) {
    try {
      const gltf = useGLTF('https://github.com/jake222colostate/enviornment/raw/main/low_poly_fantasy_mountain.glb');
      scene = gltf.scene;
    } catch (error) {
      console.warn('Failed to load fantasy mountain model:', error);
    }
  }
  
  // Memoize mountain instances to prevent re-creation on every render
  const mountainInstances = useMemo(() => {
    if (!scene || !shouldLoadModel) return [];
    
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Generate mountains for left side
      const leftMountainCount = 2 + Math.floor(seededRandom(seed + 100) * 2);
      for (let i = 0; i < leftMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 1000;
        const z = worldZ - (i * (chunkSize / leftMountainCount)) - seededRandom(mountainSeed) * 12;
        const x = -35 - seededRandom(mountainSeed + 1) * 20;
        const y = seededRandom(mountainSeed + 2) * 2;
        
        const rotationY = seededRandom(mountainSeed + 3) * Math.PI * 2;
        const scale = 1.2 + seededRandom(mountainSeed + 4) * 0.8;
        
        instances.push({
          key: `left_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number]
        });
      }
      
      // Generate mountains for right side
      const rightMountainCount = 2 + Math.floor(seededRandom(seed + 200) * 2);
      for (let i = 0; i < rightMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 2000;
        const z = worldZ - (i * (chunkSize / rightMountainCount)) - seededRandom(mountainSeed) * 12;
        const x = 35 + seededRandom(mountainSeed + 1) * 20;
        const y = seededRandom(mountainSeed + 2) * 2;
        
        const rotationY = seededRandom(mountainSeed + 3) * Math.PI * 2;
        const scale = 1.2 + seededRandom(mountainSeed + 4) * 0.8;
        
        instances.push({
          key: `right_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number]
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize, scene, shouldLoadModel]);

  // Don't render anything if not in fantasy realm or no model loaded
  if (!shouldLoadModel || !scene) {
    return null;
  }

  return (
    <group>
      {mountainInstances.map((instance) => {
        const clonedScene = scene.clone();
        
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
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
      })}
    </group>
  );
};

// Only preload the model for fantasy realm
if (typeof window !== 'undefined') {
  useGLTF.preload('https://github.com/jake222colostate/enviornment/raw/main/low_poly_fantasy_mountain.glb');
}

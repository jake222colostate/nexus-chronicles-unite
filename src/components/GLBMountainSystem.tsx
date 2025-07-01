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
  const gltf = useGLTF('https://github.com/jake222colostate/enviornment/raw/main/low_poly_fantasy_mountain_draco.glb');
  const scene = gltf.scene;

  const shouldRender = realm === 'fantasy';
  
  // Memoize mountain instances to prevent re-creation on every render
  const mountainInstances = useMemo(() => {
    if (!shouldRender) return [];
    
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
        
        const rotationX = (seededRandom(mountainSeed + 3) - 0.5) * 0.4; // X-axis rotation for natural look
        const rotationY = seededRandom(mountainSeed + 4) * Math.PI * 2;
        const rotationZ = (seededRandom(mountainSeed + 5) - 0.5) * 0.2; // Slight Z rotation
        const scale = 1.2 + seededRandom(mountainSeed + 6) * 0.8;
        
        instances.push({
          key: `left_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [rotationX, rotationY, rotationZ] as [number, number, number],
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
        
        const rotationX = (seededRandom(mountainSeed + 3) - 0.5) * 0.4; // X-axis rotation for natural look
        const rotationY = seededRandom(mountainSeed + 4) * Math.PI * 2;
        const rotationZ = (seededRandom(mountainSeed + 5) - 0.5) * 0.2; // Slight Z rotation
        const scale = 1.2 + seededRandom(mountainSeed + 6) * 0.8;
        
        instances.push({
          key: `right_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [rotationX, rotationY, rotationZ] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number]
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

// Only preload the Draco-compressed model for fantasy realm
if (typeof window !== 'undefined') {
  useGLTF.preload('https://github.com/jake222colostate/enviornment/raw/main/low_poly_fantasy_mountain_draco.glb');
  console.log('GLBMountainSystem: Preloading Draco-compressed mountain model');
}

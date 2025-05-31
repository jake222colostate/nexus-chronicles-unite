
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const FantasyMountainSystem: React.FC<FantasyMountainSystemProps> = ({
  chunks,
  chunkSize
}) => {
  const leftMountain = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_left.glb');
  const rightMountain = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_right.glb');
  
  // Memoize mountain instances
  const mountainInstances = useMemo(() => {
    if (!leftMountain.scene || !rightMountain.scene) return [];
    
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Generate left mountains every 25 units
      const leftMountainCount = Math.ceil(chunkSize / 25);
      for (let i = 0; i < leftMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 1000;
        const z = worldZ - (i * 25) - seededRandom(mountainSeed) * 5;
        const x = -30 - seededRandom(mountainSeed + 1) * 10; // Left side positioning
        const y = seededRandom(mountainSeed + 2) * 2; // Slight height variation
        
        const rotationY = seededRandom(mountainSeed + 3) * Math.PI * 0.5;
        const scale = 0.8 + seededRandom(mountainSeed + 4) * 0.4;
        
        instances.push({
          key: `left_mountain_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number],
          type: 'left'
        });
      }
      
      // Generate right mountains every 25 units
      const rightMountainCount = Math.ceil(chunkSize / 25);
      for (let i = 0; i < rightMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 2000;
        const z = worldZ - (i * 25) - seededRandom(mountainSeed) * 5;
        const x = 30 + seededRandom(mountainSeed + 1) * 10; // Right side positioning
        const y = seededRandom(mountainSeed + 2) * 2; // Slight height variation
        
        const rotationY = seededRandom(mountainSeed + 3) * Math.PI * 0.5;
        const scale = 0.8 + seededRandom(mountainSeed + 4) * 0.4;
        
        instances.push({
          key: `right_mountain_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number],
          type: 'right'
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize, leftMountain.scene, rightMountain.scene]);

  if (!leftMountain.scene || !rightMountain.scene) {
    return null;
  }

  return (
    <group>
      {mountainInstances.map((instance) => {
        const sourceScene = instance.type === 'left' ? leftMountain.scene : rightMountain.scene;
        const clonedScene = sourceScene.clone();
        
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
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

useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_left.glb');
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_right.glb');

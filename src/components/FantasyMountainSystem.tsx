
import React, { useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const FantasyMountainContent: React.FC<FantasyMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('FantasyMountainContent: Attempting to render with realm:', realm);
  
  // CRITICAL: Immediate return if not fantasy realm - before any hooks
  if (realm !== 'fantasy') {
    console.log('FantasyMountainContent: REJECTING render for realm:', realm);
    return null;
  }
  
  console.log('FantasyMountainContent: PROCEEDING with fantasy realm loading');
  
  const [hasError, setHasError] = useState(false);
  
  let leftMountain, rightMountain;
  
  try {
    leftMountain = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_left.glb');
    rightMountain = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_right.glb');
    console.log('FantasyMountainContent: Models loaded successfully');
  } catch (error) {
    console.error("Failed to load mountain models:", error);
    setHasError(true);
    return null;
  }
  
  // Memoize mountain instances
  const mountainInstances = useMemo(() => {
    // CRITICAL: Double-check realm before creating instances
    if (!leftMountain.scene || !rightMountain.scene || hasError || realm !== 'fantasy') {
      console.log('FantasyMountainContent: Skipping instance creation for realm:', realm);
      return [];
    }
    
    console.log('FantasyMountainContent: Creating mountain instances for fantasy realm');
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Generate left mountains every 25 units
      const leftMountainCount = Math.ceil(chunkSize / 25);
      for (let i = 0; i < leftMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 1000;
        const z = worldZ - (i * 25) - seededRandom(mountainSeed) * 5;
        const x = -30 - seededRandom(mountainSeed + 1) * 10;
        const y = seededRandom(mountainSeed + 2) * 2;
        
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
        const x = 30 + seededRandom(mountainSeed + 1) * 10;
        const y = seededRandom(mountainSeed + 2) * 2;
        
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
    
    console.log('FantasyMountainContent: Created', instances.length, 'mountain instances');
    return instances;
  }, [chunks, chunkSize, leftMountain.scene, rightMountain.scene, hasError, realm]);

  // CRITICAL: Final realm check before rendering
  if (!leftMountain.scene || !rightMountain.scene || hasError || realm !== 'fantasy') {
    console.log('FantasyMountainContent: Final check failed for realm:', realm);
    return null;
  }

  console.log('FantasyMountainContent: Rendering', mountainInstances.length, 'mountain instances');

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

export const FantasyMountainSystem: React.FC<FantasyMountainSystemProps> = (props) => {
  console.log('FantasyMountainSystem: Called with realm:', props.realm);
  
  // CRITICAL: Immediate return if not fantasy realm
  if (props.realm !== 'fantasy') {
    console.log('FantasyMountainSystem: REJECTING render for realm:', props.realm);
    return null;
  }

  console.log('FantasyMountainSystem: PROCEEDING to render for FANTASY realm');

  return (
    <React.Suspense fallback={null}>
      <FantasyMountainContent {...props} />
    </React.Suspense>
  );
};

// CRITICAL: NO preloading - only load when component is actually used

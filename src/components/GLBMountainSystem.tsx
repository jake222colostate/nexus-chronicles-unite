
import React, { useMemo, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface GLBMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Error boundary wrapper component for GLB loading
const GLBMountainWrapper: React.FC<GLBMountainSystemProps> = (props) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when component mounts
    setHasError(false);
  }, []);

  if (hasError) {
    return <FallbackMountainSystem {...props} />;
  }

  return (
    <React.Suspense fallback={<FallbackMountainSystem {...props} />}>
      <GLBMountainContent {...props} onError={() => setHasError(true)} />
    </React.Suspense>
  );
};

// Separate component for GLB content with error handling
const GLBMountainContent: React.FC<GLBMountainSystemProps & { onError: () => void }> = ({
  chunks,
  chunkSize,
  onError
}) => {
  let gltf;
  
  try {
    gltf = useGLTF('https://github.com/jake222colostate/enviornment/raw/main/low_poly_fantasy_mountain.glb');
  } catch (error) {
    console.error('Failed to load GLB mountain model:', error);
    onError();
    return <FallbackMountainSystem chunks={chunks} chunkSize={chunkSize} />;
  }

  const { scene } = gltf;
  
  // Memoize mountain instances
  const mountainInstances = useMemo(() => {
    if (!scene) return [];
    
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
  }, [chunks, chunkSize, scene]);

  if (!scene) {
    return <FallbackMountainSystem chunks={chunks} chunkSize={chunkSize} />;
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

// Fallback component with geometric mountains
const FallbackMountainSystem: React.FC<GLBMountainSystemProps> = ({
  chunks,
  chunkSize
}) => {
  console.log('Using fallback geometric mountains');

  const mountainInstances = useMemo(() => {
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
          key: `fallback_left_${chunk.id}_${i}`,
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
          key: `fallback_right_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number]
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainInstances.map((instance) => (
        <mesh
          key={instance.key}
          position={instance.position}
          rotation={instance.rotation}
          scale={instance.scale}
        >
          <coneGeometry args={[2, 4, 8]} />
          <meshPhongMaterial color="#8B4513" />
        </mesh>
      ))}
    </group>
  );
};

export const GLBMountainSystem: React.FC<GLBMountainSystemProps> = (props) => {
  return <GLBMountainWrapper {...props} />;
};

// Only attempt to preload if the URL is accessible
try {
  useGLTF.preload('https://github.com/jake222colostate/enviornment/raw/main/low_poly_fantasy_mountain.glb');
} catch (error) {
  console.warn('Failed to preload GLB mountain model, will use fallback:', error);
}

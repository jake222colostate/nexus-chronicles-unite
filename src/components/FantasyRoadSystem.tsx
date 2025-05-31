
import React, { useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyRoadSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const FantasyRoadContent: React.FC<FantasyRoadSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Early return if not fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }
  
  let model;
  try {
    model = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_road_tile.glb');
  } catch (error) {
    console.error("Failed to load road model:", error);
    setHasError(true);
    return null;
  }

  const { scene } = model;
  
  // Memoize road tile instances
  const roadInstances = useMemo(() => {
    if (!scene || hasError || realm !== 'fantasy') return [];
    
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Create road tiles every 10 units along the path
      const tilesPerChunk = Math.ceil(chunkSize / 10);
      for (let i = 0; i < tilesPerChunk; i++) {
        const z = worldZ - (i * 10);
        
        instances.push({
          key: `road_${chunk.id}_${i}`,
          position: [0, -0.5, z] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number]
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize, scene, hasError, realm]);

  if (!scene || hasError || realm !== 'fantasy') {
    return null;
  }

  return (
    <group>
      {roadInstances.map((instance) => {
        const clonedScene = scene.clone();
        
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

export const FantasyRoadSystem: React.FC<FantasyRoadSystemProps> = (props) => {
  // Early return if not fantasy realm
  if (props.realm !== 'fantasy') {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <FantasyRoadContent {...props} />
    </React.Suspense>
  );
};

// Only preload if we might need it for fantasy realm
try {
  useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_road_tile.glb');
} catch (error) {
  console.warn('Failed to preload road model:', error);
}

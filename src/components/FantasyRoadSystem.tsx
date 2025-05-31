
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
  console.log('FantasyRoadContent: Attempting to render with realm:', realm);
  
  // CRITICAL: Immediate return if not fantasy realm - before any hooks
  if (realm !== 'fantasy') {
    console.log('FantasyRoadContent: REJECTING render for realm:', realm);
    return null;
  }
  
  console.log('FantasyRoadContent: PROCEEDING with fantasy realm loading');
  
  const [hasError, setHasError] = useState(false);
  
  let model;
  try {
    model = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_road_tile.glb');
    console.log('FantasyRoadContent: Model loaded successfully');
  } catch (error) {
    console.error("Failed to load road model:", error);
    setHasError(true);
    return null;
  }

  const { scene } = model;
  
  // Memoize road tile instances
  const roadInstances = useMemo(() => {
    // CRITICAL: Triple-check realm before creating instances
    if (!scene || hasError || realm !== 'fantasy') {
      console.log('FantasyRoadContent: Skipping instance creation for realm:', realm);
      return [];
    }
    
    console.log('FantasyRoadContent: Creating road instances for fantasy realm');
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
    
    console.log('FantasyRoadContent: Created', instances.length, 'road instances');
    return instances;
  }, [chunks, chunkSize, scene, hasError, realm]);

  // CRITICAL: Final realm check before rendering
  if (!scene || hasError || realm !== 'fantasy') {
    console.log('FantasyRoadContent: Final check failed for realm:', realm);
    return null;
  }

  console.log('FantasyRoadContent: Rendering', roadInstances.length, 'road instances');

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
  console.log('FantasyRoadSystem: Called with realm:', props.realm);
  
  // CRITICAL: Immediate return if not fantasy realm
  if (props.realm !== 'fantasy') {
    console.log('FantasyRoadSystem: REJECTING render for realm:', props.realm);
    return null;
  }

  console.log('FantasyRoadSystem: PROCEEDING to render for FANTASY realm');

  return (
    <React.Suspense fallback={null}>
      <FantasyRoadContent {...props} />
    </React.Suspense>
  );
};

// CRITICAL: NO preloading - only load when component is actually used

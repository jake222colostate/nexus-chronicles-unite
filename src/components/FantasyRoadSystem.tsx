
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
  console.log('FantasyRoadContent: Checking realm before any operations:', realm);
  
  // CRITICAL: Absolutely no operations if not fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyRoadContent: EARLY EXIT - not fantasy realm');
    return null;
  }
  
  console.log('FantasyRoadContent: Proceeding with FANTASY realm only');
  
  const [hasError, setHasError] = useState(false);
  
  // Only call useGLTF hook if we're definitely in fantasy realm
  let model;
  try {
    console.log('FantasyRoadContent: Loading GLTF model for fantasy realm');
    model = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_road_tile.glb');
    console.log('FantasyRoadContent: GLTF model loaded successfully');
  } catch (error) {
    console.error("FantasyRoadContent: Failed to load road model:", error);
    setHasError(true);
    return null;
  }

  const { scene } = model;
  
  // Memoize road tile instances
  const roadInstances = useMemo(() => {
    if (!scene || hasError) {
      console.log('FantasyRoadContent: Skipping instance creation - missing scene or error');
      return [];
    }
    
    console.log('FantasyRoadContent: Creating road instances');
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
  }, [chunks, chunkSize, scene, hasError]);

  if (!scene || hasError) {
    console.log('FantasyRoadContent: Final check failed - no rendering');
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
  
  // CRITICAL: Absolutely no rendering if not fantasy realm
  if (props.realm !== 'fantasy') {
    console.log('FantasyRoadSystem: REJECTING - not fantasy realm');
    return null;
  }

  console.log('FantasyRoadSystem: PROCEEDING with fantasy realm');

  return (
    <React.Suspense fallback={null}>
      <FantasyRoadContent {...props} />
    </React.Suspense>
  );
};


import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const MOUNTAIN_URL = '/assets/mountain_low_poly.glb';

interface CenteredMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Fallback mountain component for performance or loading issues
const FallbackCenteredMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
}> = ({ position, scale }) => {
  console.log('FallbackCenteredMountain: Rendering fallback mountain at position:', position);
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <coneGeometry args={[8, 15, 8]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      <mesh position={[0, -5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[10, 12, 5, 8]} />
        <meshLambertMaterial color="#5A4A63" />
      </mesh>
    </group>
  );
};

// Separate component that properly uses useGLTF hook
const MountainModel: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
}> = ({ position, scale }) => {
  console.log('MountainModel: Attempting to load mountain model from:', MOUNTAIN_URL);
  
  let scene, error;
  try {
    const gltfResult = useGLTF(MOUNTAIN_URL);
    scene = gltfResult.scene;
    error = gltfResult.error;
    console.log('MountainModel: useGLTF result:', { scene: !!scene, error });
  } catch (loadError) {
    console.error('MountainModel: Exception during useGLTF:', loadError);
    return <FallbackCenteredMountain position={position} scale={scale} />;
  }
  
  if (error) {
    console.error('MountainModel: GLB loading error:', error);
    return <FallbackCenteredMountain position={position} scale={scale} />;
  }
  
  if (!scene) {
    console.warn('MountainModel: GLB scene is null, using fallback');
    return <FallbackCenteredMountain position={position} scale={scale} />;
  }
  
  console.log('MountainModel: Successfully loaded GLB scene, children count:', scene.children.length);
  
  const clonedScene = useMemo(() => {
    console.log('MountainModel: Cloning and optimizing scene');
    const clone = scene.clone();
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimize for mobile performance
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.side = THREE.FrontSide;
            });
          } else {
            child.material.side = THREE.FrontSide;
          }
        }
        
        // Standard geometry optimization
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
      }
    });
    
    console.log('MountainModel: Scene cloned and optimized');
    return clone;
  }, [scene]);
  
  console.log('MountainModel: Rendering primitive at position:', position, 'scale:', scale);
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      scale={scale}
    />
  );
};

// Error boundary wrapper for mountain loading
const MountainWithFallback: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
}> = ({ position, scale }) => {
  return (
    <Suspense fallback={<FallbackCenteredMountain position={position} scale={scale} />}>
      <MountainModel position={position} scale={scale} />
    </Suspense>
  );
};

export const CenteredMountainSystem: React.FC<CenteredMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('CenteredMountainSystem: Component called with:', {
    realm,
    chunksLength: chunks.length,
    chunkSize
  });

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('CenteredMountainSystem: Not fantasy realm, returning null');
    return null;
  }

  const mountainInstances = useMemo(() => {
    console.log('CenteredMountainSystem: Creating mountain instances for', chunks.length, 'chunks');
    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk, chunkIndex) => {
      // Create mountain instances every 40 units along Z-axis for proper spacing
      for (let zOffset = -20; zOffset < chunkSize + 20; zOffset += 40) {
        const finalZ = chunk.worldZ - zOffset;
        
        console.log(`CenteredMountainSystem: Creating mountain for chunk ${chunkIndex}, zOffset ${zOffset}, finalZ: ${finalZ}`);
        
        // Single centered mountain at X = 0, embedded slightly below terrain
        instances.push(
          <MountainWithFallback
            key={`centered-${chunk.id}-${zOffset}`}
            position={[0, -0.5, finalZ]} // Y = -0.5 for natural embedding
            scale={[1.5, 1.5, 1.5]} // Adjusted scale for vertical phone layout
          />
        );
      }
    });
    
    console.log(`CenteredMountainSystem: Generated ${instances.length} centered mountains at X=0`);
    return instances;
  }, [chunks, chunkSize]);

  console.log('CenteredMountainSystem: About to render', mountainInstances.length, 'mountain instances');

  return (
    <group>
      {mountainInstances}
      {/* Debug marker to show where mountains should be */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);
console.log('CenteredMountainSystem: Preloading mountain model from:', MOUNTAIN_URL);

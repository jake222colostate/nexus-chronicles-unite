
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
  console.log('MountainModel: Loading mountain model from:', MOUNTAIN_URL);
  
  const { scene, error } = useGLTF(MOUNTAIN_URL);
  
  if (error) {
    console.error('MountainModel: Failed to load GLB model:', error);
    return <FallbackCenteredMountain position={position} scale={scale} />;
  }
  
  if (!scene) {
    console.warn('MountainModel: GLB scene is null, using fallback');
    return <FallbackCenteredMountain position={position} scale={scale} />;
  }
  
  console.log('MountainModel: Successfully loaded GLB scene');
  
  const clonedScene = useMemo(() => {
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
    
    return clone;
  }, [scene]);
  
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

  return <>{mountainInstances}</>;
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);
console.log('CenteredMountainSystem: Preloading mountain model from:', MOUNTAIN_URL);

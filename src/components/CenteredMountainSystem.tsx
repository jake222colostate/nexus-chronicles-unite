
import React, { useMemo } from 'react';
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

const CenteredMountain: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
}> = ({ position, scale }) => {
  try {
    const { scene } = useGLTF(MOUNTAIN_URL);
    
    if (!scene) {
      return <FallbackCenteredMountain position={position} scale={scale} />;
    }
    
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
  } catch (error) {
    console.warn('Failed to load centered mountain model, using fallback');
    return <FallbackCenteredMountain position={position} scale={scale} />;
  }
};

export const CenteredMountainSystem: React.FC<CenteredMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainInstances = useMemo(() => {
    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk, chunkIndex) => {
      // Create mountain instances every 40 units along Z-axis for proper spacing
      for (let zOffset = -20; zOffset < chunkSize + 20; zOffset += 40) {
        const finalZ = chunk.worldZ - zOffset;
        
        // Single centered mountain at X = 0, embedded slightly below terrain
        instances.push(
          <CenteredMountain
            key={`centered-${chunk.id}-${zOffset}`}
            position={[0, -0.5, finalZ]} // Y = -0.5 for natural embedding
            scale={[1.5, 1.5, 1.5]} // Adjusted scale for vertical phone layout
          />
        );
      }
    });
    
    return instances;
  }, [chunks, chunkSize]);

  console.log(`CenteredMountainSystem: Generated ${mountainInstances.length} centered mountains at X=0`);

  return <>{mountainInstances}</>;
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);

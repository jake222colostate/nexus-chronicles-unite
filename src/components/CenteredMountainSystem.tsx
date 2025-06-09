
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// Use local mountain asset for consistent mobile rendering
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
  rotation: [number, number, number];
}> = ({ position, scale, rotation }) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Create a valley-like structure with two ridges */}
      <mesh position={[-8, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[6, 12, 8]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      <mesh position={[8, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[6, 12, 8]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {/* Valley floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 20]} />
        <meshLambertMaterial color="#5A4A63" />
      </mesh>
    </group>
  );
};

const CenteredMountain: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}> = ({ position, scale, rotation }) => {
  try {
    const { scene } = useGLTF(MOUNTAIN_URL);
    
    if (!scene) {
      return <FallbackCenteredMountain position={position} scale={scale} rotation={rotation} />;
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
        rotation={rotation}
      />
    );
  } catch (error) {
    console.warn('Failed to load centered mountain model, using fallback');
    return <FallbackCenteredMountain position={position} scale={scale} rotation={rotation} />;
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
        
        // Single mountain positioned to create a central valley for the path
        // Rotate if needed to align valley properly with path direction
        instances.push(
          <CenteredMountain
            key={`centered-${chunk.id}-${zOffset}`}
            position={[0, -1, finalZ]} // Slightly lowered for natural valley floor
            scale={[2, 2, 2]} // Larger scale for proper valley width
            rotation={[0, 0, 0]} // No rotation - use model as-is initially
          />
        );
      }
    });
    
    return instances;
  }, [chunks, chunkSize]);

  console.log(`CenteredMountainSystem: Generated ${mountainInstances.length} centered mountains with central valley`);

  return <>{mountainInstances}</>;
};

// Preload the local mountain model
useGLTF.preload(MOUNTAIN_URL);

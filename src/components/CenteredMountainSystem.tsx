
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
      {/* Create a valley-like structure with two ridges - positioned to create central path */}
      <mesh position={[-12, 2, 0]} castShadow receiveShadow>
        <coneGeometry args={[8, 16, 8]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      <mesh position={[12, 2, 0]} castShadow receiveShadow>
        <coneGeometry args={[8, 16, 8]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {/* Valley floor - wider for natural path */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 25]} />
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
      console.warn('Mountain model not loaded, using fallback');
      return <FallbackCenteredMountain position={position} scale={scale} rotation={rotation} />;
    }

    console.log('Mountain model loaded successfully at position:', position);
    
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
    console.warn('Failed to load mountain model, using fallback:', error);
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
      // Create single mountain instance every 60 units for proper spacing
      // This ensures the valley continues naturally through the terrain
      for (let zOffset = -30; zOffset < chunkSize + 30; zOffset += 60) {
        const finalZ = chunk.worldZ - zOffset;
        
        // Single mountain positioned with valley center at X=0 for player path
        instances.push(
          <CenteredMountain
            key={`mountain-${chunk.id}-${zOffset}`}
            position={[0, -2, finalZ]} // Lowered to create natural valley floor
            scale={[2.5, 2, 2.5]} // Scaled to create proper valley width
            rotation={[0, 0, 0]} // No rotation - use valley as designed
          />
        );
      }
    });
    
    return instances;
  }, [chunks, chunkSize]);

  console.log(`CenteredMountainSystem: Generated ${mountainInstances.length} mountain instances with centered valley`);

  return <>{mountainInstances}</>;
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);


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
      {/* Create a single mountain with natural valley structure */}
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[15, 20, 12]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {/* Valley floor - natural depression in the center */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 40]} />
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

    console.log('Single mountain model loaded successfully at position:', position);
    
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

  // Render only ONE mountain instance that contains the natural valley
  const singleMountainInstance = useMemo(() => {
    // Position the single mountain at the center, with proper scale to show the valley
    // The mountain_low_poly.glb should have a natural valley that the player moves through
    return (
      <CenteredMountain
        key="single-mountain-with-valley"
        position={[0, -1, 0]} // Centered at origin, slightly lowered
        scale={[3, 2.5, 4]} // Scale to make the valley path visible and traversable
        rotation={[0, 0, 0]} // No rotation - use the model's natural orientation
      />
    );
  }, []);

  console.log('CenteredMountainSystem: Rendering single mountain with natural valley');

  return <>{singleMountainInstance}</>;
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);

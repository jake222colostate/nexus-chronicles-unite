
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
const FallbackSingleMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
  rotation: [number, number, number];
}> = ({ position, scale, rotation }) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Single mountain mesh with natural valley shape */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[20, 15, 16]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {/* Natural valley depression */}
      <mesh position={[0, -8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 50]} />
        <meshLambertMaterial color="#4A3A53" />
      </mesh>
    </group>
  );
};

const SingleMountainModel: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}> = ({ position, scale, rotation }) => {
  const { scene } = useGLTF(MOUNTAIN_URL);
  
  const processedScene = useMemo(() => {
    if (!scene) return null;
    
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
  
  if (!processedScene) {
    console.warn('Mountain model not loaded, using fallback');
    return <FallbackSingleMountain position={position} scale={scale} rotation={rotation} />;
  }

  console.log('Single mountain model with natural valley loaded at:', position);
  
  return (
    <primitive 
      object={processedScene} 
      position={position} 
      scale={scale}
      rotation={rotation}
    />
  );
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

  // Render exactly ONE mountain instance with its natural valley
  const mountainInstance = useMemo(() => {
    console.log('CenteredMountainSystem: Creating single mountain with natural valley');
    
    return (
      <SingleMountainModel
        key="single-mountain-natural-valley"
        position={[0, -5, 0]} // Position so natural valley is at ground level
        scale={[1.5, 1.5, 1.5]} // Moderate scale to keep natural proportions
        rotation={[0, 0, 0]} // No rotation to preserve natural valley orientation
      />
    );
  }, []); // Empty dependency array - render once only

  console.log('CenteredMountainSystem: Rendering single mountain with natural valley');

  return <>{mountainInstance}</>;
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);

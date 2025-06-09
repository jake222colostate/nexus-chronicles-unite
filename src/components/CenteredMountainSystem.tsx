
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
      {/* Create a mountain with natural valley at center */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[25, 18, 16]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {/* Valley depression at center for player path */}
      <mesh position={[0, -12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 60]} />
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

  console.log('Single mountain model positioned for natural valley at world center:', position);
  
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

  // Position the mountain so its natural valley is centered at world origin
  const mountainInstance = useMemo(() => {
    console.log('CenteredMountainSystem: Positioning single mountain with natural valley at world center');
    
    return (
      <SingleMountainModel
        key="centered-mountain-natural-valley"
        position={[0, -10, 0]} // Lower the mountain so valley is at ground level
        scale={[2, 2, 2]} // Larger scale to create proper valley width
        rotation={[0, Math.PI, 0]} // Rotate 180 degrees to orient valley correctly
      />
    );
  }, []); // Empty dependency array - render once only

  console.log('CenteredMountainSystem: Rendering mountain with natural valley centered at world origin');

  return <>{mountainInstance}</>;
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);


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

// Fallback mountain component
const FallbackSingleMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
  rotation: [number, number, number];
}> = ({ position, scale, rotation }) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[15, 12, 16]} />
        <meshLambertMaterial color="#6B5B73" />
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
    return <FallbackSingleMountain position={position} scale={scale} rotation={rotation} />;
  }
  
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
  
  // Generate mountain walls along straight lines
  const mountainInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Left mountain wall - straight line at X = -25
      instances.push({
        key: `left_mountain_${chunk.id}`,
        position: [-25, -8, worldZ] as [number, number, number],
        scale: [1.2, 1.5, 1.2] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      });
      
      // Right mountain wall - straight line at X = +25
      instances.push({
        key: `right_mountain_${chunk.id}`,
        position: [25, -8, worldZ] as [number, number, number],
        scale: [1.2, 1.5, 1.2] as [number, number, number],
        rotation: [0, Math.PI, 0] as [number, number, number] // Mirror for variation
      });
    });
    
    console.log(`CenteredMountainSystem: Generated ${instances.length} mountain walls in straight lines`);
    return instances;
  }, [chunks]);
  
  return (
    <group name="StraightLineMountainSystem">
      {mountainInstances.map((instance) => (
        <SingleMountainModel
          key={instance.key}
          position={instance.position}
          scale={instance.scale}
          rotation={instance.rotation}
        />
      ))}
    </group>
  );
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);

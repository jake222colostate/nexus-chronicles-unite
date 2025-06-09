
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const MOUNTAIN_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_mountain_left_draco.glb';

interface OptimizedMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Fallback mountain component for performance
const FallbackMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
  isRightSide?: boolean;
}> = ({ position, scale, isRightSide = false }) => {
  return (
    <group position={position} scale={isRightSide ? [-scale[0], scale[1], scale[2]] : scale}>
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

const OptimizedMountain: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  isRightSide?: boolean;
}> = ({ position, scale, isRightSide = false }) => {
  try {
    const { scene } = useGLTF(MOUNTAIN_URL);
    
    if (!scene) {
      return <FallbackMountain position={position} scale={scale} isRightSide={isRightSide} />;
    }
    
    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      
      // Remove backfaces and optimize geometry
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Enable backface culling for performance
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.side = THREE.FrontSide;
              });
            } else {
              child.material.side = THREE.FrontSide;
            }
          }
          
          // Optimize geometry
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
        scale={isRightSide ? [-scale[0], scale[1], scale[2]] : scale}
      />
    );
  } catch (error) {
    console.warn('Failed to load optimized mountain model, using fallback');
    return <FallbackMountain position={position} scale={scale} isRightSide={isRightSide} />;
  }
};

export const OptimizedMountainSystem: React.FC<OptimizedMountainSystemProps> = ({
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
      // Create mountain instances every 60 units along Z-axis for infinite scrolling
      for (let zOffset = -30; zOffset < chunkSize + 30; zOffset += 60) {
        const finalZ = chunk.worldZ - zOffset;
        
        // Left mountain at X = -20
        instances.push(
          <OptimizedMountain
            key={`left-${chunk.id}-${zOffset}`}
            position={[-20, 0, finalZ]}
            scale={[2, 2, 2]}
            isRightSide={false}
          />
        );
        
        // Right mountain at X = 20 (mirrored)
        instances.push(
          <OptimizedMountain
            key={`right-${chunk.id}-${zOffset}`}
            position={[20, 0, finalZ]}
            scale={[2, 2, 2]}
            isRightSide={true}
          />
        );
      }
    });
    
    return instances;
  }, [chunks, chunkSize]);

  return <>{mountainInstances}</>;
};

// Preload the optimized model
useGLTF.preload(MOUNTAIN_URL);

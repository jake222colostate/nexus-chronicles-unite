
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
      
      // Optimize geometry and remove unnecessary parts
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
          
          // Optimize geometry - remove half if this is the original left mountain model
          if (child.geometry && !isRightSide) {
            // Clip geometry to only show left half (negative X values)
            const geometry = child.geometry;
            if (geometry.attributes.position) {
              const positions = geometry.attributes.position.array;
              const newPositions = [];
              const newIndices = [];
              
              // Filter vertices to only include left side (X <= 0)
              for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                if (x <= 0) {
                  newPositions.push(positions[i], positions[i + 1], positions[i + 2]);
                }
              }
              
              if (newPositions.length > 0) {
                const newGeometry = new THREE.BufferGeometry();
                newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
                newGeometry.computeVertexNormals();
                newGeometry.computeBoundingBox();
                newGeometry.computeBoundingSphere();
                child.geometry = newGeometry;
              }
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
    }, [scene, isRightSide]);
    
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
      // Create mountain instances every 50 units along Z-axis for better spacing
      for (let zOffset = -25; zOffset < chunkSize + 25; zOffset += 50) {
        const finalZ = chunk.worldZ - zOffset;
        
        // Left mountain at X = -20 (using original half-model)
        instances.push(
          <OptimizedMountain
            key={`left-${chunk.id}-${zOffset}`}
            position={[-20, 0, finalZ]}
            scale={[2, 2, 2]}
            isRightSide={false}
          />
        );
        
        // Right mountain at X = +20 (mirrored version)
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

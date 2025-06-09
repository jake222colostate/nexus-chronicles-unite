
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// Use the correct mountain model path that exists in the project
const MOUNTAIN_URL = 'https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/mountain.glb';

interface CenteredMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Enhanced fallback mountain component
const FallbackSingleMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
  rotation: [number, number, number];
}> = ({ position, scale, rotation }) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Main mountain peak */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[20, 25, 8]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {/* Mountain base */}
      <mesh position={[0, -10, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[25, 30, 8, 8]} />
        <meshLambertMaterial color="#5A4A63" />
      </mesh>
      {/* Additional peak details */}
      <mesh position={[0, 15, 0]} castShadow receiveShadow>
        <coneGeometry args={[12, 15, 6]} />
        <meshLambertMaterial color="#8B7B93" />
      </mesh>
    </group>
  );
};

const SingleMountainModel: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}> = ({ position, scale, rotation }) => {
  try {
    const { scene } = useGLTF(MOUNTAIN_URL);
    
    const processedScene = useMemo(() => {
      if (!scene) {
        console.log('Mountain scene not loaded, using fallback');
        return null;
      }
      
      const clone = scene.clone();
      
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.material) {
            // Create mountain material with purple-toned hue
            const mountainMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0.5, 0.3, 0.6), // Purple-toned
              roughness: 0.9,
              metalness: 0.0
            });
            child.material = mountainMaterial;
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
  } catch (error) {
    console.warn('Failed to load mountain model, using fallback:', error);
    return <FallbackSingleMountain position={position} scale={scale} rotation={rotation} />;
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
  
  // Generate mountain walls using the same asset repeatedly along straight lines
  const mountainInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Generate multiple mountains per chunk for better coverage
      for (let zOffset = -chunkSize/2; zOffset < chunkSize/2; zOffset += 25) {
        const finalZ = worldZ + zOffset;
        
        // Left mountain wall - straight line at X = -30
        instances.push({
          key: `left_mountain_${chunk.id}_${zOffset}`,
          position: [-30, 0, finalZ] as [number, number, number],
          scale: [2.0, 2.0, 2.0] as [number, number, number],
          rotation: [0, Math.random() * 0.5, 0] as [number, number, number] // Slight random rotation
        });
        
        // Right mountain wall - straight line at X = +30
        instances.push({
          key: `right_mountain_${chunk.id}_${zOffset}`,
          position: [30, 0, finalZ] as [number, number, number],
          scale: [2.0, 2.0, 2.0] as [number, number, number],
          rotation: [0, Math.PI + (Math.random() * 0.5), 0] as [number, number, number] // Mirror + slight variation
        });
      }
    });
    
    console.log(`CenteredMountainSystem: Generated ${instances.length} mountain instances in straight lines`);
    return instances;
  }, [chunks, chunkSize]);
  
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

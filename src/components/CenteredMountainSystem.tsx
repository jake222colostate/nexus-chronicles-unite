
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
    console.warn('Mountain model not loaded, using fallback');
    return <FallbackSingleMountain position={position} scale={scale} rotation={rotation} />;
  }

  console.log('CenteredMountainSystem: Rendering mountain at position:', position);
  
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
    console.log('CenteredMountainSystem: Not fantasy realm, skipping mountain render');
    return null;
  }

  console.log('CenteredMountainSystem: Rendering wide valley with mountains moved further away');
  
  // Generate mountain walls at even greater distance with lowered Y position
  const mountainInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      // Create mountain walls at extreme distances with guaranteed clear center
      for (let zOffset = 0; zOffset < chunkSize; zOffset += 25) {
        const finalZ = chunk.worldZ + zOffset;
        
        // Left mountain wall at X=-180 (MUCH further away) - LOWERED into ground
        instances.push({
          key: `mountain_left_${chunk.id}_${zOffset}`,
          position: [-180, -10, finalZ] as [number, number, number], // MOVED from -120 to -180
          scale: [0.6, 0.6, 0.6] as [number, number, number], // Smaller scale
          rotation: [0, 0, 0] as [number, number, number]
        });
        
        // Right mountain wall at X=+180 (MUCH further away) - LOWERED into ground
        instances.push({
          key: `mountain_right_${chunk.id}_${zOffset}`,
          position: [180, -10, finalZ] as [number, number, number], // MOVED from 120 to 180
          scale: [0.6, 0.6, 0.6] as [number, number, number], // Smaller scale
          rotation: [0, Math.PI, 0] as [number, number, number] // Flip for variety
        });
      }
    });
    
    console.log(`CenteredMountainSystem: Generated ${instances.length} mountain instances moved to ±180 units`);
    return instances;
  }, [chunks, chunkSize]);
  
  return (
    <group name="LoweredMountainSystem">
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

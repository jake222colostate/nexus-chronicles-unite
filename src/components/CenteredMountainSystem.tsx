
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

  console.log('CenteredMountainSystem: Rendering infinite mountain chunks with tighter valley');
  
  // Generate seamless mountain instances that tile forward infinitely
  const mountainInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      // Create multiple mountain instances per chunk to ensure seamless tiling
      // Place mountains every 25 units along Z-axis for seamless coverage
      for (let zOffset = 0; zOffset < chunkSize; zOffset += 25) {
        const finalZ = chunk.worldZ + zOffset;
        
        // Single centered mountain at X=0 with tighter valley scale
        instances.push({
          key: `mountain_${chunk.id}_${zOffset}`,
          position: [0, -2, finalZ] as [number, number, number],
          scale: [1.4, 1.4, 1.4] as [number, number, number], // Tighter valley with 1.4x scale
          rotation: [0, 0, 0] as [number, number, number]
        });
      }
    });
    
    console.log(`CenteredMountainSystem: Generated ${instances.length} mountain instances for infinite terrain`);
    return instances;
  }, [chunks, chunkSize]);
  
  return (
    <group name="InfiniteMountainSystem">
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

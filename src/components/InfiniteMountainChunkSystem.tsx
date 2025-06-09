
import React, { useMemo, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

const MOUNTAIN_URL = '/assets/mountain_low_poly.glb';

interface InfiniteMountainChunkSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Single mountain instance with enhanced scaling and positioning
const ScaledMountainInstance: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  chunkId: string;
}> = ({ position, scale, rotation, chunkId }) => {
  const { scene } = useGLTF(MOUNTAIN_URL);
  const mountainRef = useRef<THREE.Group>(null);
  
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
    // Fallback mountain with proper positioning
    return (
      <group ref={mountainRef} position={position} scale={scale} rotation={rotation}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <coneGeometry args={[25, 20, 16]} />
          <meshLambertMaterial color="#6B5B73" />
        </mesh>
      </group>
    );
  }

  console.log(`InfiniteMountainChunkSystem: Rendering mountain chunk ${chunkId} at position:`, position, 'scale:', scale);
  
  return (
    <primitive 
      ref={mountainRef}
      object={processedScene} 
      position={position} 
      scale={scale}
      rotation={rotation}
    />
  );
};

export const InfiniteMountainChunkSystem: React.FC<InfiniteMountainChunkSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const { camera } = useThree();
  const mountainInstancesRef = useRef<Map<string, THREE.Group>>(new Map());

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('InfiniteMountainChunkSystem: Not fantasy realm, skipping mountain render');
    return null;
  }

  console.log('InfiniteMountainChunkSystem: Generating infinite mountain chunks with improved positioning');
  
  // Generate mountain instances - one per chunk for seamless infinite terrain
  const mountainInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      // Position mountain at chunk center with proper above-ground positioning
      const scaleFactor = 1.2; // Slightly reduced scale for better performance
      
      instances.push({
        key: `mountain_${chunk.id}`,
        position: [0, 0, chunk.worldZ] as [number, number, number], // Positioned at ground level (Y=0)
        scale: [scaleFactor, scaleFactor, scaleFactor] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        chunkId: chunk.id
      });
    });
    
    console.log(`InfiniteMountainChunkSystem: Generated ${instances.length} mountain instances at ground level`);
    return instances;
  }, [chunks]);

  // Clean up mountain instances when chunks are destroyed
  useEffect(() => {
    const currentChunkIds = new Set(chunks.map(c => c.id));
    const instanceKeys = Array.from(mountainInstancesRef.current.keys());
    
    instanceKeys.forEach(key => {
      const chunkId = key.replace('mountain_', '');
      if (!currentChunkIds.has(chunkId)) {
        mountainInstancesRef.current.delete(key);
        console.log(`Cleaned up mountain instance for chunk ${chunkId}`);
      }
    });
  }, [chunks]);

  // Performance monitoring
  useFrame(() => {
    if (camera && mountainInstances.length > 0) {
      const cameraZ = camera.position.z;
      if (Math.floor(cameraZ) % 50 === 0) {
        console.log(`Camera Z: ${cameraZ.toFixed(1)}, Active mountain chunks: ${mountainInstances.length}`);
      }
    }
  });
  
  return (
    <group name="InfiniteMountainSystem">
      {mountainInstances.map((instance) => (
        <ScaledMountainInstance
          key={instance.key}
          position={instance.position}
          scale={instance.scale}
          rotation={instance.rotation}
          chunkId={instance.chunkId}
        />
      ))}
    </group>
  );
};

// Preload the mountain model
useGLTF.preload(MOUNTAIN_URL);

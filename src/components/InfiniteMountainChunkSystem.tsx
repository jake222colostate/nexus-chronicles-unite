
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

// Single mountain instance with enhanced visibility
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
    // Large fallback mountain that's definitely visible
    return (
      <group ref={mountainRef} position={position} scale={scale} rotation={rotation}>
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <coneGeometry args={[30, 30, 16]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 15, 0]} castShadow receiveShadow>
          <coneGeometry args={[20, 20, 16]} />
          <meshLambertMaterial color="#6B5B73" />
        </mesh>
      </group>
    );
  }

  console.log(`InfiniteMountainChunkSystem: Rendering visible mountain chunk ${chunkId} at position:`, position, 'scale:', scale);
  
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

  console.log('InfiniteMountainChunkSystem: Generating highly visible mountain chunks');
  
  // Generate mountain instances with better visibility
  const mountainInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      // Position mountains to be clearly visible from camera position
      const scaleFactor = 2.5; // Much larger scale for visibility
      
      instances.push({
        key: `visible_mountain_${chunk.id}`,
        position: [chunk.worldX, -5, chunk.worldZ] as [number, number, number], // Positioned at X and Z of chunk, slightly below ground
        scale: [scaleFactor, scaleFactor, scaleFactor] as [number, number, number],
        rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number], // Random rotation for variety
        chunkId: chunk.id
      });
    });
    
    console.log(`InfiniteMountainChunkSystem: Generated ${instances.length} highly visible mountain instances`);
    return instances;
  }, [chunks]);

  // Clean up mountain instances when chunks are destroyed
  useEffect(() => {
    const currentChunkIds = new Set(chunks.map(c => c.id));
    const instanceKeys = Array.from(mountainInstancesRef.current.keys());
    
    instanceKeys.forEach(key => {
      const chunkId = key.replace('visible_mountain_', '');
      if (!currentChunkIds.has(chunkId)) {
        mountainInstancesRef.current.delete(key);
        console.log(`Cleaned up mountain instance for chunk ${chunkId}`);
      }
    });
  }, [chunks]);

  // Log camera and mountain positions for debugging
  useFrame(() => {
    if (camera && mountainInstances.length > 0) {
      const cameraPos = camera.position;
      if (Math.floor(cameraPos.z) % 25 === 0) {
        console.log(`Camera at [${cameraPos.x.toFixed(1)}, ${cameraPos.y.toFixed(1)}, ${cameraPos.z.toFixed(1)}], Mountains: ${mountainInstances.length}`);
        mountainInstances.slice(0, 3).forEach((instance, i) => {
          console.log(`Mountain ${i}: position [${instance.position.join(', ')}]`);
        });
      }
    }
  });
  
  return (
    <group name="HighlyVisibleMountainSystem">
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

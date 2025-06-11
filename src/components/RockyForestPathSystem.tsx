
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface RockyForestPathSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Individual path segment component
const RockyPathSegment: React.FC<{ 
  position: [number, number, number]; 
  rotation?: number;
}> = ({ position, rotation = 0 }) => {
  
  try {
    const { scene } = useGLTF('/assets/rocky_forest_path_vbhsfesga_low.glb');
    
    if (!scene) {
      console.warn('Rocky forest path model not loaded');
      return null;
    }

    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      
      // Configure all meshes for proper rendering and fog integration
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false; // Prevent disappearing
          
          // Ensure materials work with fog
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(mat => {
              mat.fog = true; // Enable fog interaction
              mat.needsUpdate = true;
            });
          }
        }
      });
      
      return clone;
    }, [scene]);

    return (
      <group 
        position={position} 
        rotation={[0, rotation, 0]} // Try different rotation values if needed
        scale={[2.5, 1, 4]} // Keep the larger scale for better coverage
      >
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    console.error('Failed to load rocky forest path:', error);
    return null;
  }
};

export const RockyForestPathSystem: React.FC<RockyForestPathSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate path segments for infinite looping with proper grounding
  const pathSegments = useMemo(() => {
    const segments = [];
    const segmentLength = 20; // Large segments for fewer pieces
    
    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Calculate how many segments we need per chunk
      const segmentsPerChunk = Math.ceil(chunkSize / segmentLength) + 1; // +1 for overlap
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const z = worldZ - (i * segmentLength);
        
        segments.push({
          x: 0, // Path runs down the center
          y: -2.0, // FIXED: Lower the path significantly to ground level
          z: z,
          rotation: Math.PI, // FIXED: Try 180-degree rotation to face forward
          chunkId: chunk.id,
          segmentIndex: i
        });
      }
    });
    
    console.log(`RockyForestPathSystem: Generated ${segments.length} properly grounded path segments with corrected orientation`);
    return segments;
  }, [chunks, chunkSize]);

  return (
    <group name="RockyForestPathSystem">
      {pathSegments.map((segment) => (
        <Suspense key={`rocky-path-${segment.chunkId}-${segment.segmentIndex}`} fallback={null}>
          <RockyPathSegment
            position={[segment.x, segment.y, segment.z]}
            rotation={segment.rotation}
          />
        </Suspense>
      ))}
    </group>
  );
};

// Preload the rocky forest path model
useGLTF.preload('/assets/rocky_forest_path_vbhsfesga_low.glb');

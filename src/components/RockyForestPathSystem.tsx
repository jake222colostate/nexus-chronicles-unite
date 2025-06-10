
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
        rotation={[0, rotation, 0]}
        scale={[2.5, 1, 1]} // Made wider (2.5x width)
      >
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    console.error('Failed to load rocky forest path:', error);
    return null;
  }
};

// Sky Crystal component
const SkyCrystal: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
}> = ({ position, scale, rotation }) => {
  const { scene } = useGLTF('/assets/magic_crystal_game_ready.glb');
  
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    
    const clone = scene.clone();
    
    // Create glowing crystal material
    const crystalMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.1, 0.9, 0.9), // Bright cyan
      emissive: new THREE.Color(0.05, 0.4, 0.8),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = crystalMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = false;
      }
    });

    return clone;
  }, [scene]);

  if (!clonedScene) return null;

  return (
    <group 
      position={position} 
      rotation={[0, rotation, 0]}
      scale={[scale, scale, scale]}
    >
      <primitive object={clonedScene} />
      
      {/* Add glow effect */}
      <pointLight
        position={[0, 0, 0]}
        color={new THREE.Color(0.1, 0.9, 0.9)}
        intensity={2}
        distance={15}
        castShadow={false}
      />
    </group>
  );
};

// Simple seeded random for consistent crystal placement
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
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

  // Generate path segments for seamless connection
  const pathSegments = useMemo(() => {
    const segments = [];
    const segmentLength = 4; // Reduced for better connection
    
    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Calculate segments per chunk with overlap for seamless connection
      const segmentsPerChunk = Math.ceil(chunkSize / segmentLength) + 2; // +2 for better overlap
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const z = worldZ - (i * segmentLength);
        
        segments.push({
          x: 0, // Path runs down the center
          y: -2.0, // Properly grounded into terrain
          z: z,
          rotation: 0, // Facing straight forward (no rotation needed)
          chunkId: chunk.id,
          segmentIndex: i
        });
      }
    });
    
    console.log(`RockyForestPathSystem: Generated ${segments.length} connected path segments`);
    return segments;
  }, [chunks, chunkSize]);

  // Generate sky crystals
  const skyCrystals = useMemo(() => {
    const crystals = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const crystalCount = 3 + Math.floor(seededRandom(seed + 200) * 3); // 3-5 crystals per chunk
      
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 300;
        
        // Position crystals high in the sky, spread around
        const x = (seededRandom(crystalSeed) - 0.5) * 200; // Spread across valley
        const y = 25 + seededRandom(crystalSeed + 1) * 30; // High in sky (25-55 units up)
        const z = worldZ + (seededRandom(crystalSeed + 2) - 0.5) * chunkSize;
        
        const scale = 0.8 + seededRandom(crystalSeed + 3) * 0.6; // Varied sizes
        const rotation = seededRandom(crystalSeed + 4) * Math.PI * 2;
        
        crystals.push({
          x, y, z, scale, rotation,
          chunkId: chunk.id,
          crystalIndex: i
        });
      }
    });
    
    console.log(`RockyForestPathSystem: Generated ${crystals.length} sky crystals`);
    return crystals;
  }, [chunks, chunkSize]);

  return (
    <group name="RockyForestPathSystem">
      {/* Path segments */}
      {pathSegments.map((segment) => (
        <Suspense key={`rocky-path-${segment.chunkId}-${segment.segmentIndex}`} fallback={null}>
          <RockyPathSegment
            position={[segment.x, segment.y, segment.z]}
            rotation={segment.rotation}
          />
        </Suspense>
      ))}
      
      {/* Sky crystals */}
      {skyCrystals.map((crystal) => (
        <Suspense key={`sky-crystal-${crystal.chunkId}-${crystal.crystalIndex}`} fallback={null}>
          <SkyCrystal
            position={[crystal.x, crystal.y, crystal.z]}
            scale={crystal.scale}
            rotation={crystal.rotation}
          />
        </Suspense>
      ))}
    </group>
  );
};

// Preload the models
useGLTF.preload('/assets/rocky_forest_path_vbhsfesga_low.glb');
useGLTF.preload('/assets/magic_crystal_game_ready.glb');

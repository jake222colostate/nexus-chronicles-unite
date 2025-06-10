
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// Asset URLs for the fantasy mountain models
const FANTASY_MOUNTAIN_LEFT_URL = '/assets/fantasy_mountain_left.glb';
const FANTASY_MOUNTAIN_RIGHT_URL = '/assets/fantasy_mountain_right.glb';

interface OptimizedFantasyMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Fallback mountain component for performance and error handling
const FallbackMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
  side: 'left' | 'right';
}> = ({ position, scale, side }) => {
  return (
    <group position={position} scale={scale}>
      {/* Main mountain peak */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[8, 20, 12]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {/* Mountain base */}
      <mesh position={[0, -5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[12, 15, 10, 16]} />
        <meshLambertMaterial color="#5A4A63" />
      </mesh>
      {/* Additional rocky formations */}
      <mesh position={[side === 'left' ? 3 : -3, -2, 2]} castShadow receiveShadow>
        <octahedronGeometry args={[4]} />
        <meshLambertMaterial color="#4A3A53" />
      </mesh>
    </group>
  );
};

const OptimizedMountain: React.FC<{
  position: [number, number, number];
  side: 'left' | 'right';
  chunkId: string;
}> = ({ position, side, chunkId }) => {
  const modelUrl = side === 'left' ? FANTASY_MOUNTAIN_LEFT_URL : FANTASY_MOUNTAIN_RIGHT_URL;
  
  try {
    const { scene } = useGLTF(modelUrl);
    
    if (!scene) {
      console.warn(`OptimizedMountain: Failed to load ${side} mountain model, using fallback`);
      return <FallbackMountain position={position} scale={[1.5, 1.0, 1.5]} side={side} />;
    }
    
    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      
      // Remove all tree-related meshes to prevent random spawning
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Remove any tree, vegetation, or foliage meshes
          const isTree = child.name.toLowerCase().includes('tree') || 
                         child.name.toLowerCase().includes('forest') ||
                         child.name.toLowerCase().includes('vegetation') ||
                         child.name.toLowerCase().includes('foliage') ||
                         child.name.toLowerCase().includes('leaves') ||
                         child.name.toLowerCase().includes('branch') ||
                         child.name.toLowerCase().includes('pine') ||
                         child.name.toLowerCase().includes('oak') ||
                         (child.material && child.material.name && 
                          (child.material.name.toLowerCase().includes('tree') ||
                           child.material.name.toLowerCase().includes('leaf') ||
                           child.material.name.toLowerCase().includes('bark') ||
                           child.material.name.toLowerCase().includes('foliage')));
          
          if (isTree) {
            // Remove the tree mesh completely from the parent
            if (child.parent) {
              child.parent.remove(child);
            }
            return;
          }
          
          // Configure remaining meshes for proper rendering
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ensure proper material settings
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
    
    // Clamped scale to fix elevation issues - limit vertical scale
    const clampedScale: [number, number, number] = [
      side === 'right' ? -1.2 : 1.2, // Mirror for right side
      0.8, // Clamped vertical scale to prevent too tall mountains
      1.2
    ];
    
    return (
      <primitive 
        object={clonedScene} 
        position={position} 
        scale={clampedScale}
      />
    );
  } catch (error) {
    console.error(`OptimizedMountain: Failed to load ${side} mountain model:`, error);
    return <FallbackMountain position={position} scale={[1.5, 1.0, 1.5]} side={side} />;
  }
};

export const OptimizedFantasyMountainSystem: React.FC<OptimizedFantasyMountainSystemProps> = ({
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
    
    chunks.forEach((chunk) => {
      // Create continuous mountain placement along Z-axis with chunk-based loading
      const mountainSpacing = 30; // Mountain every 30 units along Z
      const mountainCount = Math.ceil(chunkSize / mountainSpacing) + 1; // Ensure overlap between chunks
      
      for (let i = 0; i < mountainCount; i++) {
        const zOffset = i * mountainSpacing;
        const finalZ = chunk.worldZ - zOffset;
        
        // Left mountain at X = -18 (closer to center as requested)
        instances.push(
          <OptimizedMountain
            key={`left-${chunk.id}-${i}`}
            position={[-18, 0, finalZ]}
            side="left"
            chunkId={chunk.id}
          />
        );
        
        // Right mountain at X = +18 (closer to center as requested, mirrored)
        instances.push(
          <OptimizedMountain
            key={`right-${chunk.id}-${i}`}
            position={[18, 0, finalZ]}
            side="right"
            chunkId={chunk.id}
          />
        );
      }
    });
    
    console.log(`OptimizedFantasyMountainSystem: Generated ${instances.length} mountain instances with controlled tree removal`);
    return instances;
  }, [chunks, chunkSize]);

  return (
    <group name="OptimizedFantasyMountainSystem">
      {mountainInstances}
    </group>
  );
};

// Preload the fantasy mountain models for better performance
useGLTF.preload(FANTASY_MOUNTAIN_LEFT_URL);
useGLTF.preload(FANTASY_MOUNTAIN_RIGHT_URL);

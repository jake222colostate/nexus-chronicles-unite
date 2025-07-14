import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_MOUNTAIN_LEFT_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_mountain_left_draco.glb';
const FANTASY_MOUNTAIN_RIGHT_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_mountain_right_draco.glb';

// Fallback mountain component using basic geometry
const FallbackMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
  side: 'left' | 'right';
}> = ({ position, scale, side }) => {
  return (
    <group position={position} scale={scale}>
      {/* Main mountain peak */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[3, 6, 8]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      {/* Secondary peak */}
      <mesh position={[side === 'left' ? -2 : 2, -1, 1]} castShadow receiveShadow>
        <coneGeometry args={[2, 4, 6]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
      {/* Rock formations */}
      <mesh position={[side === 'left' ? 1 : -1, -2, -1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1]} />
        <meshLambertMaterial color="#696969" />
      </mesh>
    </group>
  );
};

interface MountainProps {
  url: string;
  position: [number, number, number];
  scale: [number, number, number];
  side: 'left' | 'right';
}

function Mountain({ url, position, scale, side }: MountainProps) {
  // Loading Draco-compressed mountain model
  
  try {
    const { scene } = useGLTF(url);
    
    if (!scene) {
      console.warn('Mountain: Draco-compressed scene is null for URL:', url, 'using fallback');
      return <FallbackMountain position={position} scale={scale} side={side} />;
    }
    
    // Successfully loaded mountain model
    const clonedScene = scene.clone();
    
    // Ensure all meshes in the scene have proper materials and shadows
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
    
    return <primitive object={clonedScene} position={position} scale={scale} />;
  } catch (error) {
    console.error(`Mountain: Failed to load Draco-compressed mountain model: ${url}, using fallback`, error);
    return <FallbackMountain position={position} scale={scale} side={side} />;
  }
}

interface FantasyMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyMountainSystem: React.FC<FantasyMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render in fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainInstances = useMemo(() => {
    // Generate mountain instances for each chunk
    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk) => {
      // Create mountain instances tiled every 60 units along the Z-axis
      // Starting 30 units ahead for better coverage
      for (let zOffset = -30; zOffset < chunkSize + 20; zOffset += 60) {
        const finalZ = chunk.worldZ - zOffset;
        
        // Left side mountains slightly closer at x = -30
        instances.push(
          <Suspense key={`left-${chunk.id}-${zOffset}`} fallback={null}>
            <Mountain
              url={FANTASY_MOUNTAIN_LEFT_URL}
              position={[-30, 0, finalZ]}
              scale={[2, 2, 2]}
              side="left"
            />
          </Suspense>
        );
        
        // Right side mountains slightly closer at x = 30
        instances.push(
          <Suspense key={`right-${chunk.id}-${zOffset}`} fallback={null}>
            <Mountain
              url={FANTASY_MOUNTAIN_RIGHT_URL}
              position={[30, 0, finalZ]}
              scale={[2, 2, 2]}
              side="right"
            />
          </Suspense>
        );
      }
    });
    
    return instances;
  }, [chunks, chunkSize, realm]);

  return <>{mountainInstances}</>;
};

// Preload the Draco-compressed models
useGLTF.preload(FANTASY_MOUNTAIN_LEFT_URL);
useGLTF.preload(FANTASY_MOUNTAIN_RIGHT_URL);

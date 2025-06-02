
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_MOUNTAIN_LEFT_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_mountain_left.glb';
const FANTASY_MOUNTAIN_RIGHT_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_mountain_right.glb';

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
  console.log('Mountain: Loading from', url, 'at position:', position);
  
  try {
    const { scene } = useGLTF(url);
    
    if (!scene) {
      console.warn('Mountain: Scene is null for URL:', url, 'using fallback');
      return <FallbackMountain position={position} scale={scale} side={side} />;
    }
    
    console.log('Mountain: Successfully loaded GLB, rendering at position:', position, 'scale:', scale);
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
    console.error(`Mountain: Failed to load mountain model: ${url}, using fallback`, error);
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
  console.log('FantasyMountainSystem: Component mounted/rendered with:', {
    realm,
    chunksLength: chunks.length,
    chunkSize
  });

  // Early return check with logging
  if (realm !== 'fantasy') {
    console.log('FantasyMountainSystem: Not fantasy realm, realm is:', realm);
    return null;
  }

  console.log('FantasyMountainSystem: Realm is fantasy, proceeding with mountain generation');

  const mountainInstances = useMemo(() => {
    console.log('FantasyMountainSystem useMemo - Realm:', realm, 'Chunks:', chunks.length);
    
    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk, chunkIndex) => {
      console.log(`FantasyMountainSystem: Processing chunk ${chunkIndex}: worldZ=${chunk.worldZ}`);
      
      // Create mountain instances tiled every 60 units along the Z-axis
      // Starting 30 units ahead for better coverage
      for (let zOffset = -30; zOffset < chunkSize + 20; zOffset += 60) {
        const finalZ = chunk.worldZ - zOffset;
        
        console.log(`FantasyMountainSystem: Creating mountains for chunk ${chunkIndex}, zOffset ${zOffset}, finalZ: ${finalZ}`);
        
        // Left side mountains at x = -40, grounded at y = 0 (far from road)
        instances.push(
          <Suspense key={`left-${chunk.id}-${zOffset}`} fallback={null}>
            <Mountain 
              url={FANTASY_MOUNTAIN_LEFT_URL}
              position={[-40, 0, finalZ]}
              scale={[2, 2, 2]}
              side="left"
            />
          </Suspense>
        );
        
        // Right side mountains at x = 40, grounded at y = 0 (far from road)
        instances.push(
          <Suspense key={`right-${chunk.id}-${zOffset}`} fallback={null}>
            <Mountain 
              url={FANTASY_MOUNTAIN_RIGHT_URL}
              position={[40, 0, finalZ]}
              scale={[2, 2, 2]}
              side="right"
            />
          </Suspense>
        );
      }
    });
    
    console.log(`FantasyMountainSystem: Created ${instances.length} mountain instances`);
    return instances;
  }, [chunks, chunkSize, realm]);

  console.log('FantasyMountainSystem: About to render', mountainInstances.length, 'mountain instances');

  return <>{mountainInstances}</>;
};

// Don't preload the broken models
console.log('FantasyMountainSystem: Using fallback geometry for mountains');

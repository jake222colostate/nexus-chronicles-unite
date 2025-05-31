
import React, { useMemo, useRef, useEffect, useState, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_MOUNTAIN_LEFT_URL = 'https://github.com/jake222colostate/HIGHPOLY/raw/main/fantasy_mountain_left.glb';
const FANTASY_MOUNTAIN_RIGHT_URL = 'https://github.com/jake222colostate/HIGHPOLY/raw/main/fantasy_mountain_right.glb';

interface MountainProps {
  url: string;
  position: [number, number, number];
  scale: [number, number, number];
}

function Mountain({ url, position, scale }: MountainProps) {
  console.log('Mountain: Loading from', url, 'at position:', position);
  
  try {
    const { scene } = useGLTF(url);
    
    if (!scene) {
      console.error('Mountain: Scene is null for URL:', url);
      return null;
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
    console.error(`Mountain: Failed to load mountain model: ${url}`, error);
    return null;
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

// Preload the models for better performance
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload(FANTASY_MOUNTAIN_LEFT_URL);
    useGLTF.preload(FANTASY_MOUNTAIN_RIGHT_URL);
    console.log('FantasyMountainSystem: High poly fantasy mountains preloading started');
  } catch (error) {
    console.error('FantasyMountainSystem: Failed to preload models:', error);
  }
}


import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_MOUNTAIN_LEFT_URL = 'https://raw.githubusercontent.com/jake222colostate/HIGHPOLY/main/fantasy_mountain_left.glb';
const FANTASY_MOUNTAIN_RIGHT_URL = 'https://raw.githubusercontent.com/jake222colostate/HIGHPOLY/main/fantasy_mountain_right.glb';

interface MountainProps {
  url: string;
  position: [number, number, number];
  scale: [number, number, number];
  useFallback?: boolean;
}

function Mountain({ url, position, scale, useFallback = false }: MountainProps) {
  console.log('Mountain: Attempting to load', url, 'at position:', position);
  
  // Fallback geometry if GLB fails
  const fallbackGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(3, 8, 8);
    return geometry;
  }, []);

  const fallbackMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({ 
      color: '#8B7355',
      transparent: false
    });
  }, []);

  if (useFallback) {
    console.log('Mountain: Using fallback geometry at position:', position);
    return (
      <mesh position={position} scale={scale} castShadow receiveShadow>
        <primitive object={fallbackGeometry} />
        <primitive object={fallbackMaterial} />
      </mesh>
    );
  }

  try {
    const { scene } = useGLTF(url);
    
    if (!scene) {
      console.warn('Mountain: Scene is null for URL:', url);
      return (
        <mesh position={position} scale={scale} castShadow receiveShadow>
          <primitive object={fallbackGeometry} />
          <primitive object={fallbackMaterial} />
        </mesh>
      );
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
    return (
      <mesh position={position} scale={scale} castShadow receiveShadow>
        <primitive object={fallbackGeometry} />
        <primitive object={fallbackMaterial} />
      </mesh>
    );
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
  const [leftModelLoadFailed, setLeftModelLoadFailed] = useState(false);
  const [rightModelLoadFailed, setRightModelLoadFailed] = useState(false);
  const loadAttempted = useRef(false);

  console.log('FantasyMountainSystem: Component mounted/rendered with:', {
    realm,
    chunksLength: chunks.length,
    chunkSize,
    leftModelLoadFailed,
    rightModelLoadFailed
  });

  // Test model loading on mount
  useEffect(() => {
    if (!loadAttempted.current && realm === 'fantasy') {
      loadAttempted.current = true;
      
      // Test if the models can be loaded
      const testLoad = async () => {
        try {
          console.log('FantasyMountainSystem: Testing left mountain load...');
          const leftResponse = await fetch(FANTASY_MOUNTAIN_LEFT_URL);
          if (!leftResponse.ok) {
            console.error('FantasyMountainSystem: Left mountain URL not accessible:', leftResponse.status);
            setLeftModelLoadFailed(true);
          } else {
            console.log('FantasyMountainSystem: Left mountain URL is accessible');
          }
        } catch (error) {
          console.error('FantasyMountainSystem: Left mountain URL test failed:', error);
          setLeftModelLoadFailed(true);
        }

        try {
          console.log('FantasyMountainSystem: Testing right mountain load...');
          const rightResponse = await fetch(FANTASY_MOUNTAIN_RIGHT_URL);
          if (!rightResponse.ok) {
            console.error('FantasyMountainSystem: Right mountain URL not accessible:', rightResponse.status);
            setRightModelLoadFailed(true);
          } else {
            console.log('FantasyMountainSystem: Right mountain URL is accessible');
          }
        } catch (error) {
          console.error('FantasyMountainSystem: Right mountain URL test failed:', error);
          setRightModelLoadFailed(true);
        }
      };
      
      testLoad();
    }
  }, [realm]);

  // Early return check with logging
  if (realm !== 'fantasy') {
    console.log('FantasyMountainSystem: Not fantasy realm, realm is:', realm);
    return null;
  }

  console.log('FantasyMountainSystem: Realm is fantasy, proceeding with mountain generation');

  const mountainInstances = useMemo(() => {
    console.log('FantasyMountainSystem useMemo - Realm:', realm, 'Chunks:', chunks.length, 'Models failed:', { leftModelLoadFailed, rightModelLoadFailed });
    
    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk, chunkIndex) => {
      console.log(`FantasyMountainSystem: Processing chunk ${chunkIndex}: worldZ=${chunk.worldZ}`);
      
      // Create mountain instances tiled every 60 units along the Z-axis
      // Starting 30 units ahead for better coverage
      for (let zOffset = -30; zOffset < chunkSize + 20; zOffset += 60) {
        const finalZ = chunk.worldZ - zOffset;
        
        console.log(`FantasyMountainSystem: Creating mountains for chunk ${chunkIndex}, zOffset ${zOffset}, finalZ: ${finalZ}`);
        
        // Left side mountains at x = -20, grounded at y = 0
        instances.push(
          <Mountain 
            key={`left-${chunk.id}-${zOffset}`} 
            url={FANTASY_MOUNTAIN_LEFT_URL}
            position={[-20, 0, finalZ]}
            scale={[2, 2, 2]}
            useFallback={leftModelLoadFailed}
          />
        );
        
        // Right side mountains at x = 20, grounded at y = 0
        instances.push(
          <Mountain 
            key={`right-${chunk.id}-${zOffset}`} 
            url={FANTASY_MOUNTAIN_RIGHT_URL}
            position={[20, 0, finalZ]}
            scale={[2, 2, 2]}
            useFallback={rightModelLoadFailed}
          />
        );
      }
    });
    
    console.log(`FantasyMountainSystem: Created ${instances.length} mountain instances`);
    return instances;
  }, [chunks, chunkSize, realm, leftModelLoadFailed, rightModelLoadFailed]);

  console.log('FantasyMountainSystem: About to render', mountainInstances.length, 'mountain instances');

  return <>{mountainInstances}</>;
};

// Preload the models for better performance - with error handling
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload(FANTASY_MOUNTAIN_LEFT_URL);
    useGLTF.preload(FANTASY_MOUNTAIN_RIGHT_URL);
    console.log('FantasyMountainSystem: High poly fantasy mountains preloading started');
  } catch (error) {
    console.error('FantasyMountainSystem: Failed to preload models:', error);
  }
}

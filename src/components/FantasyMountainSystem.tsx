import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const MAGICAL_MOUNTAINS_URL = 'https://raw.githubusercontent.com/jake222colostate/enviornment/main/high_poly_magical_mountains_placeholder.glb';

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
  const [modelLoadFailed, setModelLoadFailed] = useState(false);
  const loadAttempted = useRef(false);

  console.log('FantasyMountainSystem: Component mounted/rendered with:', {
    realm,
    chunksLength: chunks.length,
    chunkSize,
    modelLoadFailed
  });

  // Test model loading on mount
  useEffect(() => {
    if (!loadAttempted.current && realm === 'fantasy') {
      loadAttempted.current = true;
      
      // Test if the model can be loaded
      const testLoad = async () => {
        try {
          console.log('FantasyMountainSystem: Testing model load...');
          const response = await fetch(MAGICAL_MOUNTAINS_URL);
          if (!response.ok) {
            console.error('FantasyMountainSystem: Model URL not accessible:', response.status);
            setModelLoadFailed(true);
          } else {
            console.log('FantasyMountainSystem: Model URL is accessible');
          }
        } catch (error) {
          console.error('FantasyMountainSystem: Model URL test failed:', error);
          setModelLoadFailed(true);
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
    console.log('FantasyMountainSystem useMemo - Realm:', realm, 'Chunks:', chunks.length, 'ModelLoadFailed:', modelLoadFailed);
    
    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk, chunkIndex) => {
      console.log(`FantasyMountainSystem: Processing chunk ${chunkIndex}: worldZ=${chunk.worldZ}`);
      
      // Create mountain instances tiled every 45 units along the Z-axis (within 40-50 range)
      // Starting 30 units ahead for better coverage
      for (let zOffset = -30; zOffset < chunkSize + 20; zOffset += 45) {
        const finalZ = chunk.worldZ - zOffset;
        
        console.log(`FantasyMountainSystem: Creating mountains for chunk ${chunkIndex}, zOffset ${zOffset}, finalZ: ${finalZ}`);
        
        // Left side mountains at x = -15
        instances.push(
          <Mountain 
            key={`left-${chunk.id}-${zOffset}`} 
            url={MAGICAL_MOUNTAINS_URL}
            position={[-15, -2, finalZ]}
            scale={[1.5, 1.5, 1.5]}
            useFallback={modelLoadFailed}
          />
        );
        
        // Right side mountains at x = 15, mirrored with negative X scale
        instances.push(
          <Mountain 
            key={`right-${chunk.id}-${zOffset}`} 
            url={MAGICAL_MOUNTAINS_URL}
            position={[15, -2, finalZ]}
            scale={[-1.5, 1.5, 1.5]}
            useFallback={modelLoadFailed}
          />
        );
      }
    });
    
    console.log(`FantasyMountainSystem: Created ${instances.length} mountain instances`);
    return instances;
  }, [chunks, chunkSize, realm, modelLoadFailed]);

  console.log('FantasyMountainSystem: About to render', mountainInstances.length, 'mountain instances');

  return <>{mountainInstances}</>;
};

// Preload the model for better performance - with error handling
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload(MAGICAL_MOUNTAINS_URL);
    console.log('FantasyMountainSystem: High poly magical mountains model preloading started');
  } catch (error) {
    console.error('FantasyMountainSystem: Failed to preload model:', error);
  }
}

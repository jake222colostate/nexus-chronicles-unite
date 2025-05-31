
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';

const LEFT_MOUNTAIN_URL = 'https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_left.glb';
const RIGHT_MOUNTAIN_URL = 'https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_right.glb';

interface LeftMountainProps {
  position: [number, number, number];
}

interface RightMountainProps {
  position: [number, number, number];
}

function LeftMountain({ position }: LeftMountainProps) {
  console.log('LeftMountain: Attempting to load', LEFT_MOUNTAIN_URL);
  
  const { scene, error } = useGLTF(LEFT_MOUNTAIN_URL);
  
  if (error) {
    console.error('Failed to load left mountain:', error);
    return null;
  }
  
  if (!scene) {
    console.warn('Left mountain scene is null');
    return null;
  }
  
  console.log('LeftMountain: Successfully loaded, rendering at position:', position);
  return <primitive object={scene.clone()} position={position} scale={[1.5, 1.5, 1.5]} />;
}

function RightMountain({ position }: RightMountainProps) {
  console.log('RightMountain: Attempting to load', RIGHT_MOUNTAIN_URL);
  
  const { scene, error } = useGLTF(RIGHT_MOUNTAIN_URL);
  
  if (error) {
    console.error('Failed to load right mountain:', error);
    return null;
  }
  
  if (!scene) {
    console.warn('Right mountain scene is null');
    return null;
  }
  
  console.log('RightMountain: Successfully loaded, rendering at position:', position);
  return <primitive object={scene.clone()} position={position} scale={[1.5, 1.5, 1.5]} />;
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
  const mountainInstances = useMemo(() => {
    console.log('FantasyMountainSystem render - Realm:', realm, 'Chunks:', chunks.length);
    
    // Only render in fantasy realm
    if (realm !== 'fantasy') {
      console.log('FantasyMountainSystem: Not fantasy realm, skipping');
      return [];
    }

    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk, chunkIndex) => {
      console.log(`Processing chunk ${chunkIndex}: worldZ=${chunk.worldZ}`);
      
      // Position mountains at far left and right of each chunk
      const leftMountainZ = chunk.worldZ;
      const rightMountainZ = chunk.worldZ;
      
      // Create multiple mountain instances along the Z-axis for seamless coverage
      for (let zOffset = 0; zOffset < chunkSize; zOffset += 20) {
        const finalZ = leftMountainZ - zOffset;
        
        console.log(`Creating mountains for chunk ${chunkIndex}, zOffset ${zOffset}, finalZ: ${finalZ}`);
        
        instances.push(
          <LeftMountain 
            key={`left-${chunk.id}-${zOffset}`} 
            position={[-25, 0, finalZ]} 
          />
        );
        
        instances.push(
          <RightMountain 
            key={`right-${chunk.id}-${zOffset}`} 
            position={[25, 0, finalZ]} 
          />
        );
      }
    });
    
    console.log(`FantasyMountainSystem: Created ${instances.length} mountain instances`);
    return instances;
  }, [chunks, chunkSize, realm]);

  return <>{mountainInstances}</>;
};

// Preload the models
console.log('Preloading fantasy mountain models...');
useGLTF.preload(LEFT_MOUNTAIN_URL);
useGLTF.preload(RIGHT_MOUNTAIN_URL);

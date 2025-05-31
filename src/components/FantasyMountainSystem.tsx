
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';

const LEFT_MOUNTAIN_URL = 'https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_left.glb';
const RIGHT_MOUNTAIN_URL = 'https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_mountain_right.glb';

interface MountainProps {
  url: string;
  position: [number, number, number];
}

function Mountain({ url, position }: MountainProps) {
  console.log('Mountain: Attempting to load', url);
  
  try {
    const { scene } = useGLTF(url);
    
    if (!scene) {
      console.warn('Mountain scene is null for URL:', url);
      return null;
    }
    
    console.log('Mountain: Successfully loaded, rendering at position:', position);
    return <primitive object={scene.clone()} position={position} scale={[1.5, 1.5, 1.5]} />;
  } catch (error) {
    console.error(`Failed to load mountain model: ${url}`, error);
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
      
      // Create multiple mountain instances along the Z-axis for seamless coverage
      for (let zOffset = 0; zOffset < chunkSize; zOffset += 20) {
        const finalZ = chunk.worldZ - zOffset;
        
        console.log(`FantasyMountainSystem: Creating mountains for chunk ${chunkIndex}, zOffset ${zOffset}, finalZ: ${finalZ}`);
        
        instances.push(
          <Mountain 
            key={`left-${chunk.id}-${zOffset}`} 
            url={LEFT_MOUNTAIN_URL}
            position={[-20, 0, finalZ]} 
          />
        );
        
        instances.push(
          <Mountain 
            key={`right-${chunk.id}-${zOffset}`} 
            url={RIGHT_MOUNTAIN_URL}
            position={[20, 0, finalZ]} 
          />
        );
      }
    });
    
    console.log(`FantasyMountainSystem: Created ${instances.length} mountain instances`);
    return instances;
  }, [chunks, chunkSize, realm]);

  console.log('FantasyMountainSystem: About to render', mountainInstances.length, 'mountain instances');

  return <>{mountainInstances}</>;
};

// Preload both models for better performance
if (typeof window !== 'undefined') {
  useGLTF.preload(LEFT_MOUNTAIN_URL);
  useGLTF.preload(RIGHT_MOUNTAIN_URL);
}

console.log('FantasyMountainSystem: Models will be preloaded on mount');

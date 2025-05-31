
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';

const MAGICAL_MOUNTAINS_URL = 'https://raw.githubusercontent.com/jake222colostate/enviornment/main/high_poly_magical_mountains_placeholder.glb';

interface MountainProps {
  url: string;
  position: [number, number, number];
  scale: [number, number, number];
}

function Mountain({ url, position, scale }: MountainProps) {
  console.log('Mountain: Attempting to load', url);
  
  try {
    const { scene } = useGLTF(url);
    
    if (!scene) {
      console.warn('Mountain scene is null for URL:', url);
      return null;
    }
    
    console.log('Mountain: Successfully loaded, rendering at position:', position, 'scale:', scale);
    return <primitive object={scene.clone()} position={position} scale={scale} />;
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
      // Starting 30 units ahead and tiling back 50 units as specified
      for (let zOffset = -30; zOffset < chunkSize + 20; zOffset += 25) {
        const finalZ = chunk.worldZ - zOffset;
        
        console.log(`FantasyMountainSystem: Creating mountains for chunk ${chunkIndex}, zOffset ${zOffset}, finalZ: ${finalZ}`);
        
        // Left side mountains - positioned far enough from the road
        instances.push(
          <Mountain 
            key={`left-${chunk.id}-${zOffset}`} 
            url={MAGICAL_MOUNTAINS_URL}
            position={[-35, -2, finalZ]}
            scale={[2, 2, 2]}
          />
        );
        
        // Right side mountains - mirrored via negative X scale
        instances.push(
          <Mountain 
            key={`right-${chunk.id}-${zOffset}`} 
            url={MAGICAL_MOUNTAINS_URL}
            position={[35, -2, finalZ]}
            scale={[-2, 2, 2]}
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

// Preload the model for better performance
if (typeof window !== 'undefined') {
  useGLTF.preload(MAGICAL_MOUNTAINS_URL);
}

console.log('FantasyMountainSystem: High poly magical mountains model will be preloaded on mount');

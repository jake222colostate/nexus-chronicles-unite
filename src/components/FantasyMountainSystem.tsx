
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
  try {
    const { scene } = useGLTF(LEFT_MOUNTAIN_URL);
    return <primitive object={scene.clone()} position={position} scale={[1.5, 1.5, 1.5]} />;
  } catch (e) {
    console.warn('Failed to load fantasy mountain left:', e);
    return null;
  }
}

function RightMountain({ position }: RightMountainProps) {
  try {
    const { scene } = useGLTF(RIGHT_MOUNTAIN_URL);
    return <primitive object={scene.clone()} position={position} scale={[1.5, 1.5, 1.5]} />;
  } catch (e) {
    console.warn('Failed to load fantasy mountain right:', e);
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
  const mountainInstances = useMemo(() => {
    // Only render in fantasy realm
    if (realm !== 'fantasy') {
      return [];
    }

    const instances: React.ReactNode[] = [];
    
    chunks.forEach((chunk) => {
      // Position mountains at far left and right of each chunk
      const leftMountainZ = chunk.worldZ;
      const rightMountainZ = chunk.worldZ;
      
      // Create multiple mountain instances along the Z-axis for seamless coverage
      for (let zOffset = 0; zOffset < chunkSize; zOffset += 20) {
        const finalZ = leftMountainZ - zOffset;
        
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
    
    return instances;
  }, [chunks, chunkSize, realm]);

  return <>{mountainInstances}</>;
};

// Preload the models
useGLTF.preload(LEFT_MOUNTAIN_URL);
useGLTF.preload(RIGHT_MOUNTAIN_URL);

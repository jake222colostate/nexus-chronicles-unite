
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { Vector3 } from 'three';
import * as THREE from 'three';

interface ContinuousMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const MountainSegment: React.FC<{
  position: [number, number, number];
  seed: number;
  side: 'left' | 'right';
}> = ({ position, seed, side }) => {
  const peakHeight = 5 + seededRandom(seed) * 3;
  const baseWidth = 2 + seededRandom(seed + 1) * 1;
  const segments = 6;
  
  return (
    <group position={position} rotation={[0, side === 'left' ? Math.PI * 0.05 : -Math.PI * 0.05, 0]}>
      {/* Main mountain peak - FIXED Y positioning to stay underground */}
      <mesh position={[0, peakHeight / 2 - 2, 0]} castShadow receiveShadow>
        <coneGeometry args={[baseWidth, peakHeight, segments]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      
      {/* Base foundation - FIXED Y positioning */}
      <mesh position={[0, -3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseWidth + 2, baseWidth + 2.5, 4, segments]} />
        <meshLambertMaterial color="#4A3A53" />
      </mesh>
      
      {/* Forward ridge - FIXED Y positioning */}
      <mesh 
        position={[0, -1, 2.5]} 
        rotation={[0, seededRandom(seed + 2) * Math.PI * 0.15, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.2, 3.5, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
      
      {/* Backward ridge - FIXED Y positioning */}
      <mesh 
        position={[0, -1.5, -2.5]} 
        rotation={[0, seededRandom(seed + 3) * Math.PI * 0.15, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1, 2.5, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
    </group>
  );
};

export const ContinuousMountainSystem: React.FC<ContinuousMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainSegments = useMemo(() => {
    const segments = [];
    
    const segmentSpacing = 6;
    const leftMountainX = -8;
    const rightMountainX = 8;
    const FIXED_MOUNTAIN_Y = -2; // CONSISTENT Y position for all mountains
    
    chunks.forEach((chunk) => {
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSpacing) + 4;
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const zOffset = i * segmentSpacing - segmentSpacing * 2;
        const segmentZ = chunk.worldZ + zOffset;
        const segmentSeed = chunk.seed + i * 67;
        
        // Left mountain wall - FIXED Y position
        segments.push({
          key: `left_${chunk.id}_${i}`,
          position: [leftMountainX, FIXED_MOUNTAIN_Y, segmentZ] as [number, number, number],
          seed: segmentSeed,
          side: 'left' as const
        });
        
        // Right mountain wall - FIXED Y position
        segments.push({
          key: `right_${chunk.id}_${i}`,
          position: [rightMountainX, FIXED_MOUNTAIN_Y, segmentZ] as [number, number, number],
          seed: segmentSeed + 1000,
          side: 'right' as const
        });
      }
    });
    
    console.log(`ContinuousMountainSystem: Generated ${segments.length} mountain segments with fixed underground positioning`);
    return segments;
  }, [chunks, chunkSize]);

  return (
    <group name="ContinuousMountainSystem">
      {mountainSegments.map((segment) => (
        <MountainSegment
          key={segment.key}
          position={segment.position}
          seed={segment.seed}
          side={segment.side}
        />
      ))}
    </group>
  );
};

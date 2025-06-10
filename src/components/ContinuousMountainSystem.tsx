
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
  // Create a mountain segment that ensures visibility
  const peakHeight = 8 + seededRandom(seed) * 6;
  const baseWidth = 3 + seededRandom(seed + 1) * 2;
  const segments = 6; // Low poly for performance
  
  return (
    <group position={position}>
      {/* Main mountain peak */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[baseWidth, peakHeight, segments]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      
      {/* Base foundation */}
      <mesh position={[0, -2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseWidth + 1, baseWidth + 2, 4, segments]} />
        <meshLambertMaterial color="#5A4A63" />
      </mesh>
      
      {/* Side ridges for better coverage */}
      <mesh 
        position={[side === 'left' ? -2 : 2, 1, 1]} 
        rotation={[0, seededRandom(seed + 2) * Math.PI * 0.3, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.5, 4, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
      
      <mesh 
        position={[side === 'left' ? -1 : 1, 0.5, -1]} 
        rotation={[0, seededRandom(seed + 3) * Math.PI * 0.3, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.2, 3, 5]} />
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
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainSegments = useMemo(() => {
    const segments = [];
    
    // Generate continuous mountain walls
    const segmentSpacing = 15; // Overlapping segments for continuous coverage
    const leftMountainX = -25; // Fixed distance from path center
    const rightMountainX = 25; // Fixed distance from path center
    
    chunks.forEach((chunk) => {
      // Calculate how many segments needed for this chunk with overlap
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSpacing) + 2; // +2 for overlap
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const zOffset = i * segmentSpacing - segmentSpacing; // Start before chunk
        const segmentZ = chunk.worldZ + zOffset;
        const segmentSeed = chunk.seed + i * 73;
        
        // Left mountain wall
        segments.push({
          key: `left_${chunk.id}_${i}`,
          position: [leftMountainX, 0, segmentZ] as [number, number, number],
          seed: segmentSeed,
          side: 'left' as const
        });
        
        // Right mountain wall
        segments.push({
          key: `right_${chunk.id}_${i}`,
          position: [rightMountainX, 0, segmentZ] as [number, number, number],
          seed: segmentSeed + 1000,
          side: 'right' as const
        });
      }
    });
    
    console.log(`ContinuousMountainSystem: Generated ${segments.length} mountain segments for continuous coverage`);
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

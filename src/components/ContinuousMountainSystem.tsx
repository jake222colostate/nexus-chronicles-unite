
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
  // Create a mountain segment that forms a wall
  const peakHeight = 6 + seededRandom(seed) * 4;
  const baseWidth = 2 + seededRandom(seed + 1) * 1.5;
  const segments = 6; // Low poly for performance
  
  return (
    <group position={position} rotation={[0, side === 'left' ? Math.PI * 0.1 : -Math.PI * 0.1, 0]}>
      {/* Main mountain peak - taller and more wall-like */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[baseWidth, peakHeight, segments]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      
      {/* Base foundation - wider for better coverage */}
      <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseWidth + 1.5, baseWidth + 2, 3, segments]} />
        <meshLambertMaterial color="#5A4A63" />
      </mesh>
      
      {/* Forward ridge for continuous coverage */}
      <mesh 
        position={[0, 1, 3]} 
        rotation={[0, seededRandom(seed + 2) * Math.PI * 0.2, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.5, 4, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
      
      {/* Backward ridge for continuous coverage */}
      <mesh 
        position={[0, 0.5, -3]} 
        rotation={[0, seededRandom(seed + 3) * Math.PI * 0.2, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.2, 3, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
      
      {/* Side extension toward path for better visibility */}
      <mesh 
        position={[side === 'left' ? 1.5 : -1.5, 1, 0]} 
        rotation={[0, seededRandom(seed + 4) * Math.PI * 0.1, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1, 2.5, 5]} />
        <meshLambertMaterial color="#8A7B8D" />
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
    
    // Position mountains much closer to the path for peripheral visibility
    const segmentSpacing = 8; // Closer spacing for better coverage
    const leftMountainX = -12; // Much closer to path center
    const rightMountainX = 12; // Much closer to path center
    
    chunks.forEach((chunk) => {
      // More segments for continuous coverage
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSpacing) + 3; // +3 for overlap
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const zOffset = i * segmentSpacing - segmentSpacing * 1.5; // Start well before chunk
        const segmentZ = chunk.worldZ + zOffset;
        const segmentSeed = chunk.seed + i * 73;
        
        // Left mountain wall - positioned for peripheral visibility
        segments.push({
          key: `left_${chunk.id}_${i}`,
          position: [leftMountainX, 0, segmentZ] as [number, number, number],
          seed: segmentSeed,
          side: 'left' as const
        });
        
        // Right mountain wall - positioned for peripheral visibility
        segments.push({
          key: `right_${chunk.id}_${i}`,
          position: [rightMountainX, 0, segmentZ] as [number, number, number],
          seed: segmentSeed + 1000,
          side: 'right' as const
        });
      }
    });
    
    console.log(`ContinuousMountainSystem: Generated ${segments.length} mountain segments for close peripheral visibility`);
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

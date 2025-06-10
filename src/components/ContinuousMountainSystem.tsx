
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
  // Create a mountain segment that forms a continuous wall
  const peakHeight = 5 + seededRandom(seed) * 3;
  const baseWidth = 2 + seededRandom(seed + 1) * 1;
  const segments = 6; // Low poly for performance
  
  return (
    <group position={position} rotation={[0, side === 'left' ? Math.PI * 0.05 : -Math.PI * 0.05, 0]}>
      {/* Main mountain peak - positioned to emerge from below ground */}
      <mesh position={[0, peakHeight / 2 - 1, 0]} castShadow receiveShadow>
        <coneGeometry args={[baseWidth, peakHeight, segments]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      
      {/* Base foundation - mostly underground */}
      <mesh position={[0, -2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseWidth + 2, baseWidth + 2.5, 4, segments]} />
        <meshLambertMaterial color="#4A3A53" />
      </mesh>
      
      {/* Forward ridge for continuous coverage */}
      <mesh 
        position={[0, 0, 2.5]} 
        rotation={[0, seededRandom(seed + 2) * Math.PI * 0.15, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.2, 3.5, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
      
      {/* Backward ridge for continuous coverage */}
      <mesh 
        position={[0, -0.5, -2.5]} 
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
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainSegments = useMemo(() => {
    const segments = [];
    
    // Position mountains very close to the path for strong presence
    const segmentSpacing = 6; // Tighter spacing for seamless coverage
    const leftMountainX = -8; // Very close to path center
    const rightMountainX = 8; // Very close to path center
    
    chunks.forEach((chunk) => {
      // Dense segments for continuous mountain walls
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSpacing) + 4; // +4 for complete overlap
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const zOffset = i * segmentSpacing - segmentSpacing * 2; // Start well before chunk
        const segmentZ = chunk.worldZ + zOffset;
        const segmentSeed = chunk.seed + i * 67;
        
        // Left mountain wall - close to path, partially underground
        segments.push({
          key: `left_${chunk.id}_${i}`,
          position: [leftMountainX, -1, segmentZ] as [number, number, number], // Y=-1 to place partially underground
          seed: segmentSeed,
          side: 'left' as const
        });
        
        // Right mountain wall - close to path, partially underground
        segments.push({
          key: `right_${chunk.id}_${i}`,
          position: [rightMountainX, -1, segmentZ] as [number, number, number], // Y=-1 to place partially underground
          seed: segmentSeed + 1000,
          side: 'right' as const
        });
      }
    });
    
    console.log(`ContinuousMountainSystem: Generated ${segments.length} mountain segments positioned close and low`);
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

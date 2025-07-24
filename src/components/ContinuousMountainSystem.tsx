
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
  // Create dramatic valley walls like in reference image
  const baseHeight = 15 + seededRandom(seed) * 8; // Much taller for valley effect
  const baseWidth = 8 + seededRandom(seed + 1) * 4; // Wider base
  const segments = 8; // Low-poly but smooth enough
  
  // Dark mountain silhouette colors like in reference
  const primaryColor = "#2C3E50"; // Dark blue-gray
  const secondaryColor = "#34495E"; // Slightly lighter
  const shadowColor = "#1A252F"; // Very dark for depth
  
  return (
    <group position={position}>
      {/* Main mountain wall - tall and imposing */}
      <mesh position={[0, baseHeight / 2, 0]}>
        <coneGeometry args={[baseWidth, baseHeight, segments]} />
        <meshLambertMaterial color={primaryColor} />
      </mesh>
      
      {/* Layered mountain effect - multiple overlapping peaks */}
      <mesh position={[baseWidth * 0.6, baseHeight * 0.7, -2]}>
        <coneGeometry args={[baseWidth * 0.8, baseHeight * 0.9, segments]} />
        <meshLambertMaterial color={secondaryColor} />
      </mesh>
      
      <mesh position={[-baseWidth * 0.5, baseHeight * 0.6, -1]}>
        <coneGeometry args={[baseWidth * 0.7, baseHeight * 0.8, segments]} />
        <meshLambertMaterial color={secondaryColor} />
      </mesh>
      
      {/* Background mountain layer for atmospheric depth */}
      <mesh position={[0, baseHeight * 0.4, -4]}>
        <coneGeometry args={[baseWidth * 1.5, baseHeight * 1.2, segments]} />
        <meshLambertMaterial color={shadowColor} />
      </mesh>
      
      {/* Wide base to fill the valley walls completely */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[baseWidth + 4, baseWidth + 6, 6, segments]} />
        <meshLambertMaterial color={shadowColor} />
      </mesh>
      
      {/* Additional peaks for jagged silhouette */}
      <mesh position={[side === 'left' ? -2 : 2, baseHeight * 0.8, 1]}>
        <coneGeometry args={[baseWidth * 0.5, baseHeight * 0.7, segments]} />
        <meshLambertMaterial color={primaryColor} />
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
    
    const segmentSpacing = 6; // Closer spacing for continuous walls
    const leftMountainX = -12;  // Closer to create valley corridor like reference
    const rightMountainX = 12;  // Closer to create valley corridor like reference
    const MOUNTAIN_Y = -2; // Ground level for proper valley walls
    
    chunks.forEach((chunk) => {
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSpacing) + 6;
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const zOffset = i * segmentSpacing - segmentSpacing * 3;
        const segmentZ = chunk.worldZ + zOffset;
        const segmentSeed = chunk.seed + i * 67;
        
        // Left mountain wall - moved further from path, lowered
        segments.push({
          key: `left_${chunk.id}_${i}`,
          position: [leftMountainX, MOUNTAIN_Y, segmentZ] as [number, number, number],
          seed: segmentSeed,
          side: 'left' as const
        });
        
        // Right mountain wall - moved further from path, lowered
        segments.push({
          key: `right_${chunk.id}_${i}`,
          position: [rightMountainX, MOUNTAIN_Y, segmentZ] as [number, number, number],
          seed: segmentSeed + 1000,
          side: 'right' as const
        });
      }
    });
    
    console.log(`ContinuousMountainSystem: Generated ${segments.length} mountain segments moved to ±15 units`);
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

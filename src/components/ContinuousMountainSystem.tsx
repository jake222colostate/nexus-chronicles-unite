
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
  const peakHeight = 8 + seededRandom(seed) * 4; // Taller peaks
  const baseWidth = 3 + seededRandom(seed + 1) * 2; // Wider base
  const segments = 6; // Low-poly geometry
  
  // Determine mountain layer depth for atmospheric perspective
  const depthFactor = Math.abs(position[0]) / 20; // 0 to 1 based on distance from center
  const layerColor = depthFactor > 0.7 ? "#5A6B7A" : depthFactor > 0.4 ? "#6B7A8A" : "#7A8A9A";
  
  return (
    <group position={position} rotation={[0, side === 'left' ? Math.PI * 0.05 : -Math.PI * 0.05, 0]}>
      {/* Main mountain peak - sharp geometric style */}
      <mesh position={[0, peakHeight / 2, 0]} castShadow receiveShadow>
        <coneGeometry args={[baseWidth, peakHeight, segments]} />
        <meshLambertMaterial color={layerColor} />
      </mesh>
      
      {/* Secondary peaks for layered silhouette */}
      <mesh position={[baseWidth * 0.8, peakHeight * 0.3, -1]} castShadow receiveShadow>
        <coneGeometry args={[baseWidth * 0.6, peakHeight * 0.7, segments]} />
        <meshLambertMaterial color={layerColor} />
      </mesh>
      
      <mesh position={[-baseWidth * 0.7, peakHeight * 0.4, 1.5]} castShadow receiveShadow>
        <coneGeometry args={[baseWidth * 0.5, peakHeight * 0.6, segments]} />
        <meshLambertMaterial color={layerColor} />
      </mesh>
      
      {/* Background layer mountain - more desaturated */}
      <mesh position={[0, peakHeight * 0.2, -3]} castShadow receiveShadow>
        <coneGeometry args={[baseWidth * 1.2, peakHeight * 0.8, segments]} />
        <meshLambertMaterial color="#4A5B6A" />
      </mesh>
      
      {/* Large base foundation */}
      <mesh position={[0, -2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseWidth + 2, baseWidth + 3, 4, segments]} />
        <meshLambertMaterial color="#3A4B5A" />
      </mesh>
      
      {/* Side ridges for geometric variety */}
      <mesh 
        position={[side === 'left' ? -1.5 : 1.5, peakHeight * 0.3, 0]} 
        rotation={[0, seededRandom(seed + 2) * Math.PI * 0.1, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[baseWidth * 0.4, peakHeight * 0.5, segments]} />
        <meshLambertMaterial color={layerColor} />
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
    
    const segmentSpacing = 8; // Wider spacing for cleaner silhouette
    const leftMountainX = -20;  // Further from path for better framing
    const rightMountainX = 20;  // Further from path for better framing
    const MOUNTAIN_Y = -3; // Raised for better visibility
    
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

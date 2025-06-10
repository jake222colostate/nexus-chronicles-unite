
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
  const segments = 8;
  
  return (
    <group position={position} rotation={[0, side === 'left' ? Math.PI * 0.05 : -Math.PI * 0.05, 0]}>
      {/* Main mountain peak - REPOSITIONED closer and higher */}
      <mesh position={[0, peakHeight / 2 - 1, 0]} castShadow receiveShadow>
        <coneGeometry args={[baseWidth, peakHeight, segments]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      
      {/* Large base foundation - EXTENDED underground to prevent holes */}
      <mesh position={[0, -4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseWidth + 3, baseWidth + 4, 8, segments]} />
        <meshLambertMaterial color="#4A3A53" />
      </mesh>
      
      {/* Additional underground foundation to fill terrain holes */}
      <mesh position={[0, -8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseWidth + 4, baseWidth + 5, 8, segments]} />
        <meshLambertMaterial color="#3A2A43" />
      </mesh>
      
      {/* Forward ridge - repositioned */}
      <mesh 
        position={[0, -0.5, 2.5]} 
        rotation={[0, seededRandom(seed + 2) * Math.PI * 0.15, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.2, 3.5, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
      
      {/* Backward ridge - repositioned */}
      <mesh 
        position={[0, -1, -2.5]} 
        rotation={[0, seededRandom(seed + 3) * Math.PI * 0.15, 0]}
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1, 2.5, 5]} />
        <meshLambertMaterial color="#7A6B7D" />
      </mesh>
      
      {/* Side support ridges to prevent gaps */}
      <mesh 
        position={[side === 'left' ? -1.5 : 1.5, -2, 0]} 
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.5, 4, 6]} />
        <meshLambertMaterial color="#5A4A63" />
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
    
    const segmentSpacing = 5; // Tighter spacing for seamless coverage
    const leftMountainX = -6;  // CLOSER to path (was -8)
    const rightMountainX = 6;  // CLOSER to path (was 8)
    const MOUNTAIN_Y = -1.8; // Match ground level positioning
    
    chunks.forEach((chunk) => {
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSpacing) + 6;
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const zOffset = i * segmentSpacing - segmentSpacing * 3;
        const segmentZ = chunk.worldZ + zOffset;
        const segmentSeed = chunk.seed + i * 67;
        
        // Left mountain wall - closer positioning
        segments.push({
          key: `left_${chunk.id}_${i}`,
          position: [leftMountainX, MOUNTAIN_Y, segmentZ] as [number, number, number],
          seed: segmentSeed,
          side: 'left' as const
        });
        
        // Right mountain wall - closer positioning
        segments.push({
          key: `right_${chunk.id}_${i}`,
          position: [rightMountainX, MOUNTAIN_Y, segmentZ] as [number, number, number],
          seed: segmentSeed + 1000,
          side: 'right' as const
        });
      }
    });
    
    console.log(`ContinuousMountainSystem: Generated ${segments.length} mountain segments at ground level Y=-1.8`);
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

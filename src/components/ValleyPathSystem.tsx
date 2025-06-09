
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface ValleyPathSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const ValleyPathSegment: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  index: number;
}> = ({ position, seed, index }) => {
  
  return (
    <group position={position}>
      {/* Main valley path - runs through the center of the mountain valley */}
      <mesh receiveShadow>
        <boxGeometry args={[6, 0.02, 4]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      
      {/* Valley floor detail stones */}
      {Array.from({ length: 12 + Math.floor(seededRandom(seed) * 8) }, (_, i) => {
        const stoneSeed = seed + i * 73;
        const stoneX = (seededRandom(stoneSeed) - 0.5) * 5.5;
        const stoneZ = (seededRandom(stoneSeed + 1) - 0.5) * 3.5;
        const stoneSize = 0.2 + seededRandom(stoneSeed + 2) * 0.3;
        const stoneHeight = 0.03 + seededRandom(stoneSeed + 3) * 0.02;
        
        return (
          <mesh
            key={i}
            position={[stoneX, stoneHeight / 2, stoneZ]}
            rotation={[0, seededRandom(stoneSeed + 4) * Math.PI * 2, 0]}
            receiveShadow
          >
            <boxGeometry args={[stoneSize, stoneHeight, stoneSize]} />
            <meshLambertMaterial 
              color={new THREE.Color().setHSL(0.1, 0.3, 0.4 + seededRandom(stoneSeed + 5) * 0.2)}
            />
          </mesh>
        );
      })}
      
      {/* Worn tracks in the valley floor */}
      <mesh position={[-1, 0.005, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.01, 4]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      <mesh position={[1, 0.005, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.01, 4]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Natural valley debris */}
      {Array.from({ length: 6 }, (_, i) => {
        const debrisSeed = seed + i * 91 + 2000;
        const debrisX = (seededRandom(debrisSeed) - 0.5) * 7;
        const debrisZ = (seededRandom(debrisSeed + 1) - 0.5) * 3;
        const debrisSize = 0.08 + seededRandom(debrisSeed + 2) * 0.12;
        
        return (
          <mesh
            key={i}
            position={[debrisX, 0.01, debrisZ]}
            receiveShadow
          >
            <sphereGeometry args={[debrisSize]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        );
      })}
    </group>
  );
};

export const ValleyPathSystem: React.FC<ValleyPathSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const pathSegments = useMemo(() => {
    const segments = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const segmentSize = 4;
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSize);
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const z = worldZ - (i * segmentSize);
        const segmentSeed = seed + i * 127;
        
        segments.push({
          x: 0, // Centered in the valley
          y: -0.95, // Slightly above the valley floor
          z: z,
          seed: segmentSeed,
          chunkId: chunk.id,
          index: i
        });
      }
    });
    
    return segments;
  }, [chunks, chunkSize]);

  console.log(`ValleyPathSystem: Generated ${pathSegments.length} path segments through central valley`);

  return (
    <group>
      {pathSegments.map((segment, index) => (
        <ValleyPathSegment
          key={`valley_path_${segment.chunkId}_${segment.index}`}
          position={[segment.x, segment.y, segment.z]}
          seed={segment.seed}
          index={segment.index}
        />
      ))}
    </group>
  );
};

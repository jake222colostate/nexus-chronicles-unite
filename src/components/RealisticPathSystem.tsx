
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface RealisticPathSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const RealisticPathSegment: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  index: number;
}> = ({ position, seed, index }) => {
  
  return (
    <group position={position}>
      {/* Main cobblestone path */}
      <mesh receiveShadow>
        <boxGeometry args={[8, 0.05, 6]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      
      {/* Individual cobblestones */}
      {Array.from({ length: 20 + Math.floor(seededRandom(seed) * 10) }, (_, i) => {
        const stoneSeed = seed + i * 73;
        const stoneX = (seededRandom(stoneSeed) - 0.5) * 7;
        const stoneZ = (seededRandom(stoneSeed + 1) - 0.5) * 5.5;
        const stoneSize = 0.3 + seededRandom(stoneSeed + 2) * 0.4;
        const stoneHeight = 0.05 + seededRandom(stoneSeed + 3) * 0.03;
        
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
      
      {/* Path borders with larger stones */}
      {Array.from({ length: 8 }, (_, i) => {
        const borderSeed = seed + i * 97 + 1000;
        const side = i % 2 === 0 ? -1 : 1;
        const borderX = side * (3.8 + seededRandom(borderSeed) * 0.4);
        const borderZ = (seededRandom(borderSeed + 1) - 0.5) * 5;
        const borderSize = 0.4 + seededRandom(borderSeed + 2) * 0.3;
        
        return (
          <mesh
            key={i}
            position={[borderX, 0.08, borderZ]}
            rotation={[0, seededRandom(borderSeed + 3) * Math.PI * 2, 0]}
            receiveShadow
            castShadow
          >
            <dodecahedronGeometry args={[borderSize]} />
            <meshLambertMaterial color="#696969" />
          </mesh>
        );
      })}
      
      {/* Scattered pebbles and dirt patches */}
      {Array.from({ length: 15 }, (_, i) => {
        const pebbleSeed = seed + i * 61 + 2000;
        const pebbleX = (seededRandom(pebbleSeed) - 0.5) * 12; // Can extend beyond path
        const pebbleZ = (seededRandom(pebbleSeed + 1) - 0.5) * 8;
        const pebbleSize = 0.1 + seededRandom(pebbleSeed + 2) * 0.15;
        
        return (
          <mesh
            key={i}
            position={[pebbleX, 0.02, pebbleZ]}
            receiveShadow
          >
            <sphereGeometry args={[pebbleSize]} />
            <meshLambertMaterial color="#A0522D" />
          </mesh>
        );
      })}
      
      {/* Grass patches growing through path cracks */}
      {Array.from({ length: 5 }, (_, i) => {
        const grassSeed = seed + i * 83 + 3000;
        const grassX = (seededRandom(grassSeed) - 0.5) * 6;
        const grassZ = (seededRandom(grassSeed + 1) - 0.5) * 4;
        
        return (
          <mesh
            key={i}
            position={[grassX, 0.03, grassZ]}
            rotation={[-Math.PI / 2, 0, seededRandom(grassSeed + 2) * Math.PI * 2]}
            receiveShadow
          >
            <circleGeometry args={[0.5 + seededRandom(grassSeed + 3) * 0.3, 6]} />
            <meshLambertMaterial color="#228B22" />
          </mesh>
        );
      })}
      
      {/* Worn wheel ruts */}
      <mesh position={[-1.5, 0.01, 0]} receiveShadow>
        <boxGeometry args={[0.3, 0.02, 6]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      <mesh position={[1.5, 0.01, 0]} receiveShadow>
        <boxGeometry args={[0.3, 0.02, 6]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
    </group>
  );
};

export const RealisticPathSystem: React.FC<RealisticPathSystemProps> = ({
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
      const segmentSize = 6;
      const segmentsPerChunk = Math.ceil(chunkSize / segmentSize);
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const z = worldZ - (i * segmentSize);
        const segmentSeed = seed + i * 127;
        
        segments.push({
          x: 0,
          y: -0.05,
          z: z,
          seed: segmentSeed,
          chunkId: chunk.id,
          index: i
        });
      }
    });
    
    return segments;
  }, [chunks, chunkSize]);

  return (
    <group>
      {pathSegments.map((segment, index) => (
        <RealisticPathSegment
          key={`realistic_path_${segment.chunkId}_${segment.index}`}
          position={[segment.x, segment.y, segment.z]}
          seed={segment.seed}
          index={segment.index}
        />
      ))}
    </group>
  );
};

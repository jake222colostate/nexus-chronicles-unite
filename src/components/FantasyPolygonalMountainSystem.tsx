
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyPolygonalMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const PolygonalMountain: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  scale: number;
}> = ({ position, seed, scale }) => {
  
  const peakCount = 5 + Math.floor(seededRandom(seed) * 6); // 5-10 peaks
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main mountain peaks */}
      {Array.from({ length: peakCount }, (_, i) => {
        const peakSeed = seed + i * 73;
        const peakX = (seededRandom(peakSeed) - 0.5) * 4;
        const peakY = 4 + seededRandom(peakSeed + 1) * 6;
        const peakZ = (seededRandom(peakSeed + 2) - 0.5) * 3;
        const peakScale = 0.8 + seededRandom(peakSeed + 3) * 0.6;
        
        return (
          <group key={i}>
            {/* Main peak */}
            <mesh 
              position={[peakX, peakY, peakZ]}
              scale={[peakScale, peakScale, peakScale]}
              castShadow
            >
              <coneGeometry args={[1.5, 3, 6]} />
              <meshLambertMaterial 
                color="#3f3c78"
                vertexColors={false}
              />
            </mesh>
            
            {/* Peak gradient effect */}
            <mesh 
              position={[peakX, peakY + 1, peakZ]}
              scale={[peakScale * 0.7, peakScale * 0.7, peakScale * 0.7]}
              castShadow
            >
              <coneGeometry args={[1, 2, 6]} />
              <meshLambertMaterial color="#aa69d1" />
            </mesh>
            
            {/* Crystal protrusions */}
            {Array.from({ length: 2 + Math.floor(seededRandom(peakSeed + 10) * 3) }, (_, j) => {
              const crystalSeed = peakSeed + j * 41;
              const crystalX = peakX + (seededRandom(crystalSeed) - 0.5) * 2;
              const crystalY = peakY + 0.5 + seededRandom(crystalSeed + 1) * 2;
              const crystalZ = peakZ + (seededRandom(crystalSeed + 2) - 0.5) * 2;
              const crystalScale = 0.5 + seededRandom(crystalSeed + 3) * 0.7;
              
              return (
                <mesh
                  key={j}
                  position={[crystalX, crystalY, crystalZ]}
                  scale={[crystalScale, crystalScale, crystalScale]}
                  castShadow
                >
                  <octahedronGeometry args={[0.8]} />
                  <meshPhongMaterial 
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
      
      {/* Mountain base */}
      <mesh position={[0, 1, 0]} receiveShadow>
        <cylinderGeometry args={[6, 8, 2, 8]} />
        <meshLambertMaterial color="#2a2458" />
      </mesh>
    </group>
  );
};

export const FantasyPolygonalMountainSystem: React.FC<FantasyPolygonalMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainPositions = useMemo(() => {
    const positions = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Left mountains (X = -10 to -20)
      const leftMountainCount = 1 + Math.floor(seededRandom(seed + 100) * 2);
      for (let i = 0; i < leftMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 1000;
        const x = -10 - seededRandom(mountainSeed) * 10; // -10 to -20
        const z = worldZ - (i * 12) - seededRandom(mountainSeed + 1) * 8;
        const scale = 1.0 + seededRandom(mountainSeed + 2) * 0.8;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'left'
        });
      }
      
      // Right mountains (X = +10 to +20)
      const rightMountainCount = 1 + Math.floor(seededRandom(seed + 200) * 2);
      for (let i = 0; i < rightMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 2000;
        const x = 10 + seededRandom(mountainSeed) * 10; // +10 to +20
        const z = worldZ - (i * 12) - seededRandom(mountainSeed + 1) * 8;
        const scale = 1.0 + seededRandom(mountainSeed + 2) * 0.8;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'right'
        });
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainPositions.map((pos, index) => (
        <PolygonalMountain
          key={`polygonal_mountain_${pos.chunkId}_${pos.side}_${index}`}
          position={[pos.x, pos.y, pos.z]}
          seed={pos.seed}
          scale={pos.scale}
        />
      ))}
    </group>
  );
};

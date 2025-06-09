
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
  side: 'left' | 'right';
}> = ({ position, seed, scale, side }) => {
  
  const peakCount = 3 + Math.floor(seededRandom(seed) * 3); // 3-5 peaks for better performance
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main mountain peaks - no trees, only mountain geometry */}
      {Array.from({ length: peakCount }, (_, i) => {
        const peakSeed = seed + i * 73;
        const peakX = (seededRandom(peakSeed) - 0.5) * 3;
        const peakY = 3 + seededRandom(peakSeed + 1) * 5;
        const peakZ = (seededRandom(peakSeed + 2) - 0.5) * 2;
        const peakScale = 0.7 + seededRandom(peakSeed + 3) * 0.5;
        
        return (
          <group key={i}>
            {/* Main peak */}
            <mesh 
              position={[peakX, peakY, peakZ]}
              scale={[peakScale, peakScale, peakScale]}
              castShadow
            >
              <coneGeometry args={[1.2, 2.5, 6]} />
              <meshLambertMaterial 
                color="#3f3c78"
                vertexColors={false}
              />
            </mesh>
            
            {/* Peak gradient effect */}
            <mesh 
              position={[peakX, peakY + 0.8, peakZ]}
              scale={[peakScale * 0.6, peakScale * 0.6, peakScale * 0.6]}
              castShadow
            >
              <coneGeometry args={[0.8, 1.5, 6]} />
              <meshLambertMaterial color="#aa69d1" />
            </mesh>
            
            {/* Crystal protrusions - fewer for performance */}
            {Array.from({ length: 1 + Math.floor(seededRandom(peakSeed + 10) * 2) }, (_, j) => {
              const crystalSeed = peakSeed + j * 41;
              const crystalX = peakX + (seededRandom(crystalSeed) - 0.5) * 1.5;
              const crystalY = peakY + 0.3 + seededRandom(crystalSeed + 1) * 1.5;
              const crystalZ = peakZ + (seededRandom(crystalSeed + 2) - 0.5) * 1.5;
              const crystalScale = 0.4 + seededRandom(crystalSeed + 3) * 0.5;
              
              return (
                <mesh
                  key={j}
                  position={[crystalX, crystalY, crystalZ]}
                  scale={[crystalScale, crystalScale, crystalScale]}
                  castShadow
                >
                  <octahedronGeometry args={[0.6]} />
                  <meshPhongMaterial 
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.2}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
      
      {/* Mountain base */}
      <mesh position={[0, 0.8, 0]} receiveShadow>
        <cylinderGeometry args={[5, 6, 1.6, 8]} />
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
      
      // Left mountains (X = -20, widened valley for clear player path)
      const leftMountainCount = 1 + Math.floor(seededRandom(seed + 100) * 1); // 1-2 mountains
      for (let i = 0; i < leftMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 1000;
        const x = -22 + seededRandom(mountainSeed) * 4; // -22 to -18, further from path
        const z = worldZ - (i * 15) - seededRandom(mountainSeed + 1) * 6;
        const scale = 0.9 + seededRandom(mountainSeed + 2) * 0.6;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'left' as const
        });
      }
      
      // Right mountains (X = +20, mirrored and further from path)
      const rightMountainCount = 1 + Math.floor(seededRandom(seed + 200) * 1); // 1-2 mountains
      for (let i = 0; i < rightMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 2000;
        const x = 22 - seededRandom(mountainSeed) * 4; // +18 to +22, further from path
        const z = worldZ - (i * 15) - seededRandom(mountainSeed + 1) * 6;
        const scale = 0.9 + seededRandom(mountainSeed + 2) * 0.6;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'right' as const
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
          side={pos.side}
        />
      ))}
    </group>
  );
};

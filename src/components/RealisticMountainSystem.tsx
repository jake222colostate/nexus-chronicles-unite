
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface RealisticMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const RealisticMountain: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  scale: number;
  side: 'left' | 'right';
}> = ({ position, seed, scale, side }) => {
  
  // Create more realistic mountain shapes using noise-like generation
  const generateMountainGeometry = () => {
    const geometry = new THREE.ConeGeometry(8, 25, 16, 1);
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Add variation to vertex positions to create realistic mountain shapes
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      // Add noise based on position and seed
      const noiseX = seededRandom(seed + x * 100) - 0.5;
      const noiseZ = seededRandom(seed + z * 100 + 1000) - 0.5;
      const heightFactor = y / 25; // Stronger variation at higher altitudes
      
      vertices[i] += noiseX * 3 * heightFactor;
      vertices[i + 2] += noiseZ * 3 * heightFactor;
      
      // Add some vertical variation for ridges
      if (heightFactor > 0.3) {
        vertices[i + 1] += (seededRandom(seed + x * 50 + z * 50) - 0.5) * 5 * heightFactor;
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  const peakCount = 3 + Math.floor(seededRandom(seed) * 4); // 3-6 peaks per mountain
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main mountain mass with realistic shape */}
      <mesh castShadow receiveShadow>
        <primitive object={generateMountainGeometry()} />
        <meshLambertMaterial 
          color="#4A5568" 
          vertexColors={false}
        />
      </mesh>
      
      {/* Multiple interconnected peaks for realistic silhouette */}
      {Array.from({ length: peakCount }, (_, i) => {
        const peakSeed = seed + i * 73;
        const peakX = (seededRandom(peakSeed) - 0.5) * 12;
        const peakY = 15 + seededRandom(peakSeed + 1) * 15;
        const peakZ = (seededRandom(peakSeed + 2) - 0.5) * 8;
        const peakScale = 0.6 + seededRandom(peakSeed + 3) * 0.8;
        
        // Create varied peak shapes
        const peakType = Math.floor(seededRandom(peakSeed + 4) * 3);
        let peakGeometry;
        
        switch (peakType) {
          case 0: // Jagged peak
            peakGeometry = new THREE.ConeGeometry(3 * peakScale, 8 * peakScale, 5);
            break;
          case 1: // Rounded peak
            peakGeometry = new THREE.SphereGeometry(2.5 * peakScale, 8, 6);
            break;
          case 2: // Ridge peak
            peakGeometry = new THREE.CylinderGeometry(1 * peakScale, 3 * peakScale, 6 * peakScale, 6);
            break;
          default:
            peakGeometry = new THREE.ConeGeometry(3 * peakScale, 8 * peakScale, 6);
        }
        
        return (
          <mesh
            key={i}
            position={[peakX, peakY, peakZ]}
            castShadow
            receiveShadow
          >
            <primitive object={peakGeometry} />
            <meshLambertMaterial color="#2D3748" />
          </mesh>
        );
      })}
      
      {/* Rocky outcroppings and cliff faces */}
      {Array.from({ length: 5 + Math.floor(seededRandom(seed + 100) * 5) }, (_, i) => {
        const rockSeed = seed + i * 91 + 2000;
        const rockX = (seededRandom(rockSeed) - 0.5) * 15;
        const rockY = 5 + seededRandom(rockSeed + 1) * 20;
        const rockZ = (seededRandom(rockSeed + 2) - 0.5) * 10;
        const rockScale = 0.8 + seededRandom(rockSeed + 3) * 1.5;
        
        return (
          <mesh
            key={i}
            position={[rockX, rockY, rockZ]}
            rotation={[
              (seededRandom(rockSeed + 4) - 0.5) * 0.5,
              seededRandom(rockSeed + 5) * Math.PI * 2,
              (seededRandom(rockSeed + 6) - 0.5) * 0.3
            ]}
            scale={[rockScale, rockScale * 0.8, rockScale]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1.5]} />
            <meshLambertMaterial color="#5A6575" />
          </mesh>
        );
      })}
      
      {/* Mountain base with natural slope */}
      <mesh position={[0, -5, 0]} receiveShadow>
        <cylinderGeometry args={[12, 18, 10, 12]} />
        <meshLambertMaterial color="#2A2458" />
      </mesh>
      
      {/* Snow caps on higher peaks */}
      {Array.from({ length: 2 }, (_, i) => {
        const snowSeed = seed + i * 123 + 3000;
        const snowX = (seededRandom(snowSeed) - 0.5) * 8;
        const snowY = 20 + seededRandom(snowSeed + 1) * 10;
        const snowZ = (seededRandom(snowSeed + 2) - 0.5) * 6;
        
        return (
          <mesh
            key={i}
            position={[snowX, snowY, snowZ]}
            castShadow
          >
            <sphereGeometry args={[2, 8, 6]} />
            <meshLambertMaterial color="#F7FAFC" />
          </mesh>
        );
      })}
    </group>
  );
};

export const RealisticMountainSystem: React.FC<RealisticMountainSystemProps> = ({
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
      
      // Left mountains
      const leftMountainCount = 2 + Math.floor(seededRandom(seed + 100) * 2);
      for (let i = 0; i < leftMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 1000;
        const x = -25 - seededRandom(mountainSeed) * 20; // -25 to -45
        const z = worldZ - (i * 40) - seededRandom(mountainSeed + 1) * 20;
        const scale = 1.2 + seededRandom(mountainSeed + 2) * 0.8;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'left' as const
        });
      }
      
      // Right mountains
      const rightMountainCount = 2 + Math.floor(seededRandom(seed + 200) * 2);
      for (let i = 0; i < rightMountainCount; i++) {
        const mountainSeed = seed + i * 67 + 2000;
        const x = 25 + seededRandom(mountainSeed) * 20; // +25 to +45
        const z = worldZ - (i * 40) - seededRandom(mountainSeed + 1) * 20;
        const scale = 1.2 + seededRandom(mountainSeed + 2) * 0.8;
        
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
        <RealisticMountain
          key={`realistic_mountain_${pos.chunkId}_${pos.side}_${index}`}
          position={[pos.x, pos.y, pos.z]}
          seed={pos.seed}
          scale={pos.scale}
          side={pos.side}
        />
      ))}
    </group>
  );
};

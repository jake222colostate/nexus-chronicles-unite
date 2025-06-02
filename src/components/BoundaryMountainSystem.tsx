
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface BoundaryMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const RealisticMountainCluster: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  scale: number;
  side: 'left' | 'right';
}> = ({ position, seed, scale, side }) => {
  
  const createMountainGeometry = (type: 'peak' | 'ridge' | 'cliff' | 'hill', mountainSeed: number) => {
    switch (type) {
      case 'peak':
        return new THREE.ConeGeometry(
          3 + seededRandom(mountainSeed) * 2, 
          15 + seededRandom(mountainSeed + 1) * 10, 
          8
        );
      case 'ridge':
        return new THREE.CylinderGeometry(
          0.5 + seededRandom(mountainSeed) * 1, 
          2 + seededRandom(mountainSeed + 1) * 2, 
          12 + seededRandom(mountainSeed + 2) * 8, 
          6
        );
      case 'cliff':
        return new THREE.BoxGeometry(
          4 + seededRandom(mountainSeed) * 3,
          20 + seededRandom(mountainSeed + 1) * 15,
          3 + seededRandom(mountainSeed + 2) * 2
        );
      case 'hill':
        return new THREE.SphereGeometry(
          4 + seededRandom(mountainSeed) * 3,
          8,
          6
        );
      default:
        return new THREE.ConeGeometry(3, 15, 8);
    }
  };

  const mountainTypes = ['peak', 'ridge', 'cliff', 'hill'] as const;
  const mountainCount = 4 + Math.floor(seededRandom(seed) * 3);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Create multiple mountain shapes */}
      {Array.from({ length: mountainCount }, (_, i) => {
        const mountainSeed = seed + i * 47;
        const type = mountainTypes[Math.floor(seededRandom(mountainSeed) * mountainTypes.length)];
        
        const localX = (seededRandom(mountainSeed + 1) - 0.5) * 8;
        const localY = seededRandom(mountainSeed + 2) * 3;
        const localZ = (seededRandom(mountainSeed + 3) - 0.5) * 12;
        
        const rotationY = seededRandom(mountainSeed + 4) * Math.PI * 2;
        const rotationX = (seededRandom(mountainSeed + 5) - 0.5) * 0.3;
        const rotationZ = (seededRandom(mountainSeed + 6) - 0.5) * 0.2;
        
        // Color variations for realism
        const baseHue = 0.1 + seededRandom(mountainSeed + 7) * 0.1;
        const saturation = 0.2 + seededRandom(mountainSeed + 8) * 0.3;
        const lightness = 0.25 + seededRandom(mountainSeed + 9) * 0.2;
        
        return (
          <mesh
            key={i}
            position={[localX, localY, localZ]}
            rotation={[rotationX, rotationY, rotationZ]}
            castShadow
            receiveShadow
          >
            <primitive object={createMountainGeometry(type, mountainSeed)} />
            <meshLambertMaterial 
              color={new THREE.Color().setHSL(baseHue, saturation, lightness)}
            />
          </mesh>
        );
      })}
      
      {/* Add rock formations at base */}
      {Array.from({ length: 6 + Math.floor(seededRandom(seed + 100) * 4) }, (_, i) => {
        const rockSeed = seed + i * 73 + 1000;
        const rockX = (seededRandom(rockSeed) - 0.5) * 15;
        const rockY = -2 + seededRandom(rockSeed + 1) * 2;
        const rockZ = (seededRandom(rockSeed + 2) - 0.5) * 20;
        const rockScale = 0.5 + seededRandom(rockSeed + 3) * 1.5;
        
        return (
          <mesh
            key={`rock-${i}`}
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
            <dodecahedronGeometry args={[1]} />
            <meshLambertMaterial color="#5A5A5A" />
          </mesh>
        );
      })}
      
      {/* Invisible collision barrier */}
      <mesh
        position={[0, 10, 0]}
        visible={false}
      >
        <boxGeometry args={[20, 20, 40]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export const BoundaryMountainSystem: React.FC<BoundaryMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainClusters = useMemo(() => {
    const clusters = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Left boundary mountains (X = -25 to -35)
      const leftClusterCount = 1 + Math.floor(seededRandom(seed + 100) * 2);
      for (let i = 0; i < leftClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 1000;
        const x = -30 - seededRandom(clusterSeed) * 10; // -30 to -40
        const z = worldZ - (i * 30) - seededRandom(clusterSeed + 1) * 20;
        const scale = 1.2 + seededRandom(clusterSeed + 2) * 0.8;
        
        clusters.push({
          x, y: 0, z, scale, seed: clusterSeed,
          chunkId: chunk.id, side: 'left' as const, index: i
        });
      }
      
      // Right boundary mountains (X = +25 to +35)
      const rightClusterCount = 1 + Math.floor(seededRandom(seed + 200) * 2);
      for (let i = 0; i < rightClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 2000;
        const x = 30 + seededRandom(clusterSeed) * 10; // +30 to +40
        const z = worldZ - (i * 30) - seededRandom(clusterSeed + 1) * 20;
        const scale = 1.2 + seededRandom(clusterSeed + 2) * 0.8;
        
        clusters.push({
          x, y: 0, z, scale, seed: clusterSeed,
          chunkId: chunk.id, side: 'right' as const, index: i
        });
      }
    });
    
    return clusters;
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainClusters.map((cluster) => (
        <RealisticMountainCluster
          key={`boundary_mountain_${cluster.chunkId}_${cluster.side}_${cluster.index}`}
          position={[cluster.x, cluster.y, cluster.z]}
          seed={cluster.seed}
          scale={cluster.scale}
          side={cluster.side}
        />
      ))}
    </group>
  );
};

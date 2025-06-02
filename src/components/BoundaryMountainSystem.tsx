
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

const SharpMountainCluster: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  scale: number;
  side: 'left' | 'right';
}> = ({ position, seed, scale, side }) => {
  
  const createSharpMountainGeometry = (type: 'peak' | 'ridge' | 'spire' | 'cliff', mountainSeed: number) => {
    switch (type) {
      case 'peak':
        return new THREE.ConeGeometry(
          2 + seededRandom(mountainSeed) * 1.5, 
          20 + seededRandom(mountainSeed + 1) * 15, 
          6  // Fewer segments for sharper look
        );
      case 'ridge':
        return new THREE.CylinderGeometry(
          0.3 + seededRandom(mountainSeed) * 0.5, 
          1.5 + seededRandom(mountainSeed + 1) * 1.5, 
          15 + seededRandom(mountainSeed + 2) * 10, 
          6  // Sharp ridges
        );
      case 'spire':
        return new THREE.ConeGeometry(
          0.8 + seededRandom(mountainSeed) * 0.7,
          25 + seededRandom(mountainSeed + 1) * 12,
          4  // Very sharp spires
        );
      case 'cliff':
        return new THREE.BoxGeometry(
          6 + seededRandom(mountainSeed) * 4,
          25 + seededRandom(mountainSeed + 1) * 20,
          4 + seededRandom(mountainSeed + 2) * 2
        );
      default:
        return new THREE.ConeGeometry(2, 20, 6);
    }
  };

  const mountainTypes = ['peak', 'ridge', 'spire', 'cliff'] as const;
  const mountainCount = 5 + Math.floor(seededRandom(seed) * 4);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Create multiple sharp mountain shapes */}
      {Array.from({ length: mountainCount }, (_, i) => {
        const mountainSeed = seed + i * 47;
        const type = mountainTypes[Math.floor(seededRandom(mountainSeed) * mountainTypes.length)];
        
        const localX = (seededRandom(mountainSeed + 1) - 0.5) * 6;
        const localY = seededRandom(mountainSeed + 2) * 3;
        const localZ = (seededRandom(mountainSeed + 3) - 0.5) * 10;
        
        const rotationY = seededRandom(mountainSeed + 4) * Math.PI * 2;
        const rotationX = (seededRandom(mountainSeed + 5) - 0.5) * 0.2;
        const rotationZ = (seededRandom(mountainSeed + 6) - 0.5) * 0.1;
        
        // Darker, more dramatic colors for sharp mountains
        const baseHue = 0.05 + seededRandom(mountainSeed + 7) * 0.05;
        const saturation = 0.1 + seededRandom(mountainSeed + 8) * 0.2;
        const lightness = 0.15 + seededRandom(mountainSeed + 9) * 0.15;
        
        return (
          <mesh
            key={i}
            position={[localX, localY, localZ]}
            rotation={[rotationX, rotationY, rotationZ]}
            castShadow
            receiveShadow
          >
            <primitive object={createSharpMountainGeometry(type, mountainSeed)} />
            <meshLambertMaterial 
              color={new THREE.Color().setHSL(baseHue, saturation, lightness)}
            />
          </mesh>
        );
      })}
      
      {/* Sharp rock formations at base */}
      {Array.from({ length: 8 + Math.floor(seededRandom(seed + 100) * 6) }, (_, i) => {
        const rockSeed = seed + i * 73 + 1000;
        const rockX = (seededRandom(rockSeed) - 0.5) * 12;
        const rockY = -2 + seededRandom(rockSeed + 1) * 3;
        const rockZ = (seededRandom(rockSeed + 2) - 0.5) * 15;
        const rockScale = 0.8 + seededRandom(rockSeed + 3) * 1.2;
        
        return (
          <mesh
            key={`rock-${i}`}
            position={[rockX, rockY, rockZ]}
            rotation={[
              (seededRandom(rockSeed + 4) - 0.5) * 0.3,
              seededRandom(rockSeed + 5) * Math.PI * 2,
              (seededRandom(rockSeed + 6) - 0.5) * 0.2
            ]}
            scale={[rockScale, rockScale * 1.2, rockScale]}
            castShadow
            receiveShadow
          >
            <octahedronGeometry args={[1.5]} />
            <meshLambertMaterial color="#3A3A3A" />
          </mesh>
        );
      })}
      
      {/* Invisible collision barriers extending toward path */}
      <mesh
        position={[side === 'left' ? 8 : -8, 15, 0]}
        visible={false}
      >
        <boxGeometry args={[16, 30, 40]} />
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
      
      // Left boundary mountains (closer to path, X = -18 to -28)
      const leftClusterCount = 2 + Math.floor(seededRandom(seed + 100) * 2);
      for (let i = 0; i < leftClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 1000;
        const x = -22 - seededRandom(clusterSeed) * 6; // -22 to -28, much closer to path
        const z = worldZ - (i * 25) - seededRandom(clusterSeed + 1) * 15;
        const scale = 1.4 + seededRandom(clusterSeed + 2) * 1.0;
        
        clusters.push({
          x, y: 0, z, scale, seed: clusterSeed,
          chunkId: chunk.id, side: 'left' as const, index: i
        });
      }
      
      // Right boundary mountains (closer to path, X = +18 to +28)
      const rightClusterCount = 2 + Math.floor(seededRandom(seed + 200) * 2);
      for (let i = 0; i < rightClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 2000;
        const x = 22 + seededRandom(clusterSeed) * 6; // +22 to +28, much closer to path
        const z = worldZ - (i * 25) - seededRandom(clusterSeed + 1) * 15;
        const scale = 1.4 + seededRandom(clusterSeed + 2) * 1.0;
        
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
        <SharpMountainCluster
          key={`sharp_mountain_${cluster.chunkId}_${cluster.side}_${cluster.index}`}
          position={[cluster.x, cluster.y, cluster.z]}
          seed={cluster.seed}
          scale={cluster.scale}
          side={cluster.side}
        />
      ))}
    </group>
  );
};

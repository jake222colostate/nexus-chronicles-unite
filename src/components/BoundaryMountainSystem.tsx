
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

const OptimizedMountainCluster: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  scale: number;
  side: 'left' | 'right';
}> = ({ position, seed, scale, side }) => {
  
  // Drastically reduced mountain complexity
  const mountainCount = 2; // Fixed to 2 mountains per cluster

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main peak */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[2, 15, 4]} />
        <meshLambertMaterial color="#6B5B95" />
      </mesh>
      
      {/* Secondary peak */}
      <mesh 
        position={[side === 'left' ? -1.5 : 1.5, -3, 2]} 
        castShadow 
        receiveShadow
      >
        <coneGeometry args={[1.5, 12, 4]} />
        <meshLambertMaterial color="#8B7A9E" />
      </mesh>
      
      {/* Single rock formation */}
      <mesh
        position={[(seededRandom(seed) - 0.5) * 4, -6, (seededRandom(seed + 1) - 0.5) * 6]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 4, 2]} />
        <meshLambertMaterial color="#3A3A3A" />
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
      
      // Only 1 mountain cluster per side per chunk
      const clusterSeed = seed + 1000;
      const x = -25;
      const z = worldZ;
      const scale = 1.2;
      
      clusters.push({
        x, y: 0, z, scale, seed: clusterSeed,
        chunkId: chunk.id, side: 'left' as const, index: 0
      });
      
      // Right side
      const rightClusterSeed = seed + 2000;
      clusters.push({
        x: 25, y: 0, z, scale, seed: rightClusterSeed,
        chunkId: chunk.id, side: 'right' as const, index: 0
      });
    });
    
    return clusters.slice(0, 16); // Hard limit to 16 mountain clusters total
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainClusters.map((cluster) => (
        <OptimizedMountainCluster
          key={`optimized_mountain_${cluster.chunkId}_${cluster.side}`}
          position={[cluster.x, cluster.y, cluster.z]}
          seed={cluster.seed}
          scale={cluster.scale}
          side={cluster.side}
        />
      ))}
    </group>
  );
};

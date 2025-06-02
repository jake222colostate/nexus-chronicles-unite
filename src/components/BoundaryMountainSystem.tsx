
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { OptimizedMountainCluster } from './OptimizedMountainCluster';

interface BoundaryMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
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
    
    // Process fewer chunks for better performance
    const processedChunks = chunks.slice(0, 3);
    
    processedChunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Left side mountains - closer to path
      const leftClusterCount = 1 + Math.floor(seededRandom(seed + 100) * 1);
      for (let i = 0; i < leftClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 1000;
        const x = -16 - seededRandom(clusterSeed) * 4; // Closer to path (was -22)
        const z = worldZ - (i * 40) - seededRandom(clusterSeed + 1) * 15;
        const scale = 1.2 + seededRandom(clusterSeed + 2) * 0.8;
        
        clusters.push({
          x, y: 0, z, scale, seed: clusterSeed,
          chunkId: chunk.id, side: 'left' as const, index: i
        });
      }
      
      // Right side mountains - closer to path
      const rightClusterCount = 1 + Math.floor(seededRandom(seed + 200) * 1);
      for (let i = 0; i < rightClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 2000;
        const x = 16 + seededRandom(clusterSeed) * 4; // Closer to path (was +22)
        const z = worldZ - (i * 40) - seededRandom(clusterSeed + 1) * 15;
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
        <OptimizedMountainCluster
          key={`optimized_mountain_${cluster.chunkId}_${cluster.side}_${cluster.index}`}
          position={[cluster.x, cluster.y, cluster.z]}
          seed={cluster.seed}
          scale={cluster.scale}
          side={cluster.side}
        />
      ))}
    </group>
  );
};

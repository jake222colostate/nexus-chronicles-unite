
import React, { useMemo } from 'react';
import { ChunkData } from './OptimizedChunkSystem';

interface OptimizedPathwaySystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const OptimizedPathwaySystem: React.FC<OptimizedPathwaySystemProps> = ({
  chunks,
  chunkSize
}) => {
  const pathTiles = useMemo(() => {
    return chunks.map(chunk => {
      const tiles = [];
      const { worldZ, seed } = chunk;
      const tilesPerChunk = Math.floor(chunkSize / 8);
      
      for (let i = 0; i < tilesPerChunk; i++) {
        const tileSeed = seed + i * 23;
        const z = worldZ - (i * 8) - 4;
        const xOffset = (seededRandom(tileSeed) - 0.5) * 0.6;
        const rotation = seededRandom(tileSeed + 1) * Math.PI / 20;
        const scale = 0.9 + seededRandom(tileSeed + 2) * 0.2;
        
        tiles.push(
          <group key={`tile_${chunk.id}_${i}`} position={[xOffset, -0.48, z]} rotation={[0, rotation, 0]}>
            <mesh receiveShadow castShadow>
              <boxGeometry args={[3 * scale, 0.15, 3 * scale]} />
              <meshLambertMaterial color="#8B7355" />
            </mesh>
          </group>
        );
      }
      
      return tiles;
    });
  }, [chunks, chunkSize]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, -1000]} receiveShadow>
        <planeGeometry args={[10, 4000]} />
        <meshLambertMaterial color="#6B5B73" />
      </mesh>
      {pathTiles}
    </group>
  );
};

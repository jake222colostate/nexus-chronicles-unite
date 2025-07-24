import React, { useMemo } from 'react';
import { FantasyChunkData } from './NewFantasyChunkSystem';

interface BrownDirtPathProps {
  chunks: FantasyChunkData[];
  chunkSize: number;
}

interface PathTile {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  opacity: number;
  tileType: 'main' | 'edge';
}

// Seeded random function for consistent patterns
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const BrownDirtPath: React.FC<BrownDirtPathProps> = ({
  chunks,
  chunkSize
}) => {
  const pathTiles = useMemo(() => {
    const tiles: PathTile[] = [];
    
    chunks.forEach((chunk) => {
      const { worldX, worldZ, opacity, seed } = chunk;
      
      // Create main path surface (wide brown area)
      const mainTilesPerChunk = Math.ceil(chunkSize / 6);
      
      for (let i = 0; i < mainTilesPerChunk; i++) {
        const tileZ = worldZ + (i * 6);
        const tileSeed = seed + i * 20;
        
        // Main wide path tile
        tiles.push({
          key: `main_path_${chunk.id}_${i}`,
          position: [
            worldX + (seededRandom(tileSeed) - 0.5) * 0.5,
            -1.9, // Slightly above valley floor
            tileZ
          ],
          rotation: [0, (seededRandom(tileSeed + 1) - 0.5) * 0.1, 0],
          scale: [1, 1, 1],
          opacity,
          tileType: 'main'
        });
      }
      
      // Create individual stepping stone tiles (smaller, more detailed)
      const detailTilesPerChunk = Math.ceil(chunkSize / 4);
      
      for (let i = 0; i < detailTilesPerChunk; i++) {
        const tileZ = worldZ + (i * 4) + (seededRandom(seed + i) - 0.5) * 2;
        const tileSeed = seed + i * 30 + 1000;
        
        // Left lane tile
        tiles.push({
          key: `detail_left_${chunk.id}_${i}`,
          position: [
            -2 + (seededRandom(tileSeed) - 0.5) * 1,
            -1.85,
            tileZ
          ],
          rotation: [0, (seededRandom(tileSeed + 1) - 0.5) * 0.3, 0],
          scale: [0.8 + seededRandom(tileSeed + 2) * 0.4, 1, 0.8 + seededRandom(tileSeed + 3) * 0.4],
          opacity,
          tileType: 'edge'
        });
        
        // Center lane tile
        tiles.push({
          key: `detail_center_${chunk.id}_${i}`,
          position: [
            0 + (seededRandom(tileSeed + 10) - 0.5) * 0.8,
            -1.85,
            tileZ + 1
          ],
          rotation: [0, (seededRandom(tileSeed + 11) - 0.5) * 0.3, 0],
          scale: [0.9 + seededRandom(tileSeed + 12) * 0.3, 1, 0.9 + seededRandom(tileSeed + 13) * 0.3],
          opacity,
          tileType: 'edge'
        });
        
        // Right lane tile
        tiles.push({
          key: `detail_right_${chunk.id}_${i}`,
          position: [
            2 + (seededRandom(tileSeed + 20) - 0.5) * 1,
            -1.85,
            tileZ + 0.5
          ],
          rotation: [0, (seededRandom(tileSeed + 21) - 0.5) * 0.3, 0],
          scale: [0.8 + seededRandom(tileSeed + 22) * 0.4, 1, 0.8 + seededRandom(tileSeed + 23) * 0.4],
          opacity,
          tileType: 'edge'
        });
      }
    });
    
    console.log(`BrownDirtPath: Generated ${tiles.length} path tiles`);
    return tiles;
  }, [chunks, chunkSize]);

  return (
    <group name="BrownDirtPath">
      {pathTiles.map((tile) => (
        <group
          key={tile.key}
          position={tile.position}
          rotation={tile.rotation}
          scale={tile.scale}
        >
          {tile.tileType === 'main' ? (
            // Wide path base
            <mesh castShadow receiveShadow>
              <boxGeometry args={[16, 0.2, 6]} />
              <meshStandardMaterial
                color="#8B4513"
                roughness={0.95}
                metalness={0.0}
                transparent
                opacity={tile.opacity}
              />
            </mesh>
          ) : (
            // Individual stepping stones
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2.5, 0.15, 2.5]} />
                <meshStandardMaterial
                  color="#A0522D"
                  roughness={0.9}
                  metalness={0.0}
                  transparent
                  opacity={tile.opacity}
                />
              </mesh>
              
              {/* Stone texture detail */}
              <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.2, 0.02, 2.2]} />
                <meshStandardMaterial
                  color="#8B4513"
                  roughness={1.0}
                  metalness={0.0}
                  transparent
                  opacity={tile.opacity * 0.8}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
};
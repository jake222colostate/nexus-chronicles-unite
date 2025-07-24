import React, { useMemo } from 'react';
import { FantasyChunkData } from './NewFantasyChunkSystem';

interface RaisedPathTilesProps {
  chunks: FantasyChunkData[];
  chunkSize: number;
}

interface PathTile {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  opacity: number;
  crackPattern: number;
}

// Seeded random function for consistent patterns
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const RaisedPathTiles: React.FC<RaisedPathTilesProps> = ({
  chunks,
  chunkSize
}) => {
  const pathTiles = useMemo(() => {
    const tiles: PathTile[] = [];
    
    chunks.forEach((chunk) => {
      const { worldX, worldZ, opacity, seed } = chunk;
      
      // Generate 3 lanes of path tiles per chunk
      const lanes = [-3, 0, 3]; // Left, center, right lanes
      const tilesPerLane = Math.ceil(chunkSize / 8); // One tile every 8 units
      
      lanes.forEach((laneX, laneIndex) => {
        for (let i = 0; i < tilesPerLane; i++) {
          const tileZ = worldZ + (i * 8) + (seededRandom(seed + i + laneIndex) - 0.5) * 2;
          const tileSeed = seed + i * 10 + laneIndex * 100;
          
          // Add slight random variations
          const offsetX = (seededRandom(tileSeed) - 0.5) * 0.8;
          const offsetY = seededRandom(tileSeed + 1) * 0.1;
          const rotationY = (seededRandom(tileSeed + 2) - 0.5) * 0.3;
          
          // Scale variation for worn look
          const scaleVariation = 0.9 + seededRandom(tileSeed + 3) * 0.2;
          
          tiles.push({
            key: `tile_${chunk.id}_${laneIndex}_${i}`,
            position: [
              worldX + laneX + offsetX,
              -1.4 + offsetY, // Raised above ground level
              tileZ
            ],
            rotation: [0, rotationY, 0],
            scale: [scaleVariation, 1, scaleVariation],
            opacity,
            crackPattern: seededRandom(tileSeed + 4)
          });
        }
      });
    });
    
    console.log(`RaisedPathTiles: Generated ${tiles.length} path tiles`);
    return tiles;
  }, [chunks, chunkSize]);

  return (
    <group name="RaisedPathTiles">
      {pathTiles.map((tile) => (
        <group
          key={tile.key}
          position={tile.position}
          rotation={tile.rotation}
          scale={tile.scale}
        >
          {/* Main tile surface */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.5, 0.25, 7]} />
            <meshStandardMaterial
              color="#8B6914"
              roughness={0.95}
              metalness={0.0}
              transparent
              opacity={tile.opacity}
            />
          </mesh>
          
          {/* Worn edges for detail */}
          <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.02, 6.7]} />
            <meshStandardMaterial
              color="#7A5D12"
              roughness={1.0}
              metalness={0.0}
              transparent
              opacity={tile.opacity * 0.8}
            />
          </mesh>
          
          {/* Crack details based on pattern */}
          {tile.crackPattern > 0.7 && (
            <mesh position={[0, 0.14, 0]} castShadow>
              <boxGeometry args={[0.1, 0.01, 3]} />
              <meshStandardMaterial
                color="#5D4412"
                transparent
                opacity={tile.opacity * 0.6}
              />
            </mesh>
          )}
          
          {/* Corner wear */}
          <mesh position={[1.5, 0.13, 2]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.02, 0.3]} />
            <meshStandardMaterial
              color="#6B5015"
              transparent
              opacity={tile.opacity * 0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
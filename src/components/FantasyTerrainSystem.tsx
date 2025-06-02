
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyTerrainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const FantasyTerrainSystem: React.FC<FantasyTerrainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const terrainElements = useMemo(() => {
    const elements = [];
    
    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Create hexagonal terrain tiles for the main path
      const tileCount = Math.ceil(chunkSize / 2);
      
      for (let i = 0; i < tileCount; i++) {
        const tileSeed = seed + i * 137;
        const baseZ = worldZ - (i * 2);
        
        // Main path tiles
        const pathTiles = 3 + Math.floor(seededRandom(tileSeed) * 2);
        
        for (let j = 0; j < pathTiles; j++) {
          const tileX = (seededRandom(tileSeed + j) - 0.5) * 8;
          const tileZ = baseZ + (seededRandom(tileSeed + j + 10) - 0.5) * 1.5;
          const tileY = -0.1 + (seededRandom(tileSeed + j + 20) - 0.5) * 0.4; // Random bumps
          
          // Determine tile type (dirt or grass transition)
          const isGrassTile = seededRandom(tileSeed + j + 30) < 0.15; // 15% grass tiles
          
          elements.push(
            <mesh
              key={`terrain_${chunk.id}_${i}_${j}`}
              position={[tileX, tileY, tileZ]}
              rotation={[0, seededRandom(tileSeed + j + 40) * Math.PI * 2, 0]}
              receiveShadow
            >
              <cylinderGeometry args={[1.2, 1.2, 0.2, 6]} />
              <meshLambertMaterial 
                color={isGrassTile ? "#3d7f3a" : "#8e6230"} 
              />
            </mesh>
          );
        }
        
        // Side terrain elements
        const sideTileCount = 2 + Math.floor(seededRandom(tileSeed + 100) * 3);
        
        for (let k = 0; k < sideTileCount; k++) {
          [-1, 1].forEach(side => {
            const sideX = side * (6 + seededRandom(tileSeed + k + 200) * 8);
            const sideZ = baseZ + (seededRandom(tileSeed + k + 210) - 0.5) * 3;
            const sideY = -0.2 + (seededRandom(tileSeed + k + 220) - 0.5) * 0.3;
            
            elements.push(
              <mesh
                key={`side_terrain_${chunk.id}_${i}_${k}_${side}`}
                position={[sideX, sideY, sideZ]}
                rotation={[0, seededRandom(tileSeed + k + 230) * Math.PI * 2, 0]}
                receiveShadow
              >
                <cylinderGeometry args={[1.0, 1.0, 0.15, 6]} />
                <meshLambertMaterial color="#8e6230" />
              </mesh>
            );
          });
        }
      }
    });
    
    return elements;
  }, [chunks, chunkSize]);

  return <group>{terrainElements}</group>;
};

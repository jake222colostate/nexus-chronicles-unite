
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';

interface FantasyTerrainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const FantasyTerrainSystem: React.FC<FantasyTerrainSystemProps> = React.memo(({
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
      
      // Optimized terrain generation with fewer tiles
      const tileCount = Math.ceil(chunkSize / 3); // Reduced density
      
      for (let i = 0; i < tileCount; i++) {
        const tileSeed = seed + i * 137;
        const baseZ = worldZ - (i * 3);
        
        // Main path tiles - reduced count for performance
        const pathTiles = 2 + Math.floor(seededRandom(tileSeed) * 2);
        
        for (let j = 0; j < pathTiles; j++) {
          const tileX = (seededRandom(tileSeed + j) - 0.5) * 6;
          const tileZ = baseZ + (seededRandom(tileSeed + j + 10) - 0.5) * 2;
          const tileY = -0.1 + (seededRandom(tileSeed + j + 20) - 0.5) * 0.3;
          
          // Improved tile type distribution
          const isGrassTile = seededRandom(tileSeed + j + 30) < 0.2;
          
          elements.push(
            <mesh
              key={`terrain_${chunk.id}_${i}_${j}`}
              position={[tileX, tileY, tileZ]}
              rotation={[0, seededRandom(tileSeed + j + 40) * Math.PI * 2, 0]}
              receiveShadow
              castShadow={false}
            >
              <cylinderGeometry args={[1.5, 1.5, 0.2, 6]} />
              <meshLambertMaterial 
                color={isGrassTile ? "#4a7c59" : "#8b6f47"} 
              />
            </mesh>
          );
        }
        
        // Optimized side terrain - fewer elements
        const sideTileCount = 1 + Math.floor(seededRandom(tileSeed + 100) * 2);
        
        for (let k = 0; k < sideTileCount; k++) {
          [-1, 1].forEach(side => {
            const sideX = side * (8 + seededRandom(tileSeed + k + 200) * 6);
            const sideZ = baseZ + (seededRandom(tileSeed + k + 210) - 0.5) * 4;
            const sideY = -0.15 + (seededRandom(tileSeed + k + 220) - 0.5) * 0.2;
            
            elements.push(
              <mesh
                key={`side_terrain_${chunk.id}_${i}_${k}_${side}`}
                position={[sideX, sideY, sideZ]}
                rotation={[0, seededRandom(tileSeed + k + 230) * Math.PI * 2, 0]}
                receiveShadow
                castShadow={false}
              >
                <cylinderGeometry args={[1.2, 1.2, 0.15, 6]} />
                <meshLambertMaterial color="#8b6f47" />
              </mesh>
            );
          });
        }
      }
    });
    

    return elements;
  }, [chunks, chunkSize]);

  return <group>{terrainElements}</group>;
});

FantasyTerrainSystem.displayName = 'FantasyTerrainSystem';

export { FantasyTerrainSystem };

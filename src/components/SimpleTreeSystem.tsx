
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface SimpleTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Simple geometric tree component
const SimpleTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'pine' | 'oak' | 'birch';
}> = ({ position, scale, rotation, treeType }) => {
  const colors = {
    pine: { trunk: '#654321', foliage: '#2D5A2D' },
    oak: { trunk: '#8B4513', foliage: '#228B22' },
    birch: { trunk: '#F5F5DC', foliage: '#90EE90' }
  };

  const treeColors = colors[treeType];

  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.6]} />
        <meshLambertMaterial color={treeColors.trunk} />
      </mesh>
      
      {/* Tree foliage - different shapes for different types */}
      {treeType === 'pine' ? (
        <>
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.2, 2, 8]} />
            <meshLambertMaterial color={treeColors.foliage} />
          </mesh>
          <mesh position={[0, 2.4, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.9, 1.5, 8]} />
            <meshLambertMaterial color={treeColors.foliage} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1.1, 12, 8]} />
          <meshLambertMaterial color={treeColors.foliage} />
        </mesh>
      )}
    </group>
  );
};

export const SimpleTreeSystem: React.FC<SimpleTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate tree positions
  const treePositions = useMemo(() => {
    const positions = [];
    const minDistance = 8;
    const maxAttempts = 15;

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 2-3 trees per chunk
      const treeCount = 2 + Math.floor(seededRandom(seed) * 2);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale, rotation, treeType;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 73;
          
          // Position trees away from the path
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.6;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.6;
          
          // Skip if too close to path center
          if (Math.abs(x) < 6) {
            attempts++;
            continue;
          }
          
          // Random tree type
          const typeRandom = seededRandom(treeSeed + 2);
          treeType = typeRandom < 0.4 ? 'pine' : typeRandom < 0.7 ? 'oak' : 'birch';
          
          scale = 0.8 + seededRandom(treeSeed + 3) * 0.4;
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          // Check distance from existing trees
          validPosition = positions.every(pos => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
            return distance >= minDistance;
          });
          
          attempts++;
        }
        
        if (validPosition) {
          positions.push({ x, z, scale, rotation, treeType, chunkId: chunk.id });
        }
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {treePositions.map((pos, index) => (
        <SimpleTree
          key={`simple-tree-${pos.chunkId}-${index}`}
          position={[pos.x, 0, pos.z]}
          scale={pos.scale}
          rotation={pos.rotation}
          treeType={pos.treeType}
        />
      ))}
    </group>
  );
};

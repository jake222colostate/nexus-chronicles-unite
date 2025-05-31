
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface TreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const TreeSystem: React.FC<TreeSystemProps> = ({
  chunks,
  chunkSize
}) => {
  // Memoize tree instances to prevent re-creation on every render
  const treeInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Generate trees for left side (scattered in grass areas)
      const leftTreeCount = 3 + Math.floor(seededRandom(seed + 300) * 3);
      for (let i = 0; i < leftTreeCount; i++) {
        const treeSeed = seed + i * 89 + 3000;
        const z = worldZ - (i * (chunkSize / leftTreeCount)) - seededRandom(treeSeed) * 15;
        const x = -20 - seededRandom(treeSeed + 1) * 15; // Left side positioning
        const y = seededRandom(treeSeed + 2) * 1; // Ground level
        
        // Random rotation for variety
        const rotationY = seededRandom(treeSeed + 3) * Math.PI * 2;
        
        // Scale variation for natural look
        const scale = 0.8 + seededRandom(treeSeed + 4) * 0.6;
        
        instances.push({
          key: `left_tree_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number],
          treeType: Math.floor(seededRandom(treeSeed + 5) * 3) // 3 different tree types
        });
      }
      
      // Generate trees for right side
      const rightTreeCount = 3 + Math.floor(seededRandom(seed + 400) * 3);
      for (let i = 0; i < rightTreeCount; i++) {
        const treeSeed = seed + i * 89 + 4000;
        const z = worldZ - (i * (chunkSize / rightTreeCount)) - seededRandom(treeSeed) * 15;
        const x = 20 + seededRandom(treeSeed + 1) * 15; // Right side positioning
        const y = seededRandom(treeSeed + 2) * 1; // Ground level
        
        // Random rotation for variety
        const rotationY = seededRandom(treeSeed + 3) * Math.PI * 2;
        
        // Scale variation for natural look
        const scale = 0.8 + seededRandom(treeSeed + 4) * 0.6;
        
        instances.push({
          key: `right_tree_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number],
          treeType: Math.floor(seededRandom(treeSeed + 5) * 3) // 3 different tree types
        });
      }

      // Add some trees closer to the path for depth
      const pathTreeCount = 2;
      for (let i = 0; i < pathTreeCount; i++) {
        const treeSeed = seed + i * 89 + 5000;
        const z = worldZ - (i * chunkSize) - seededRandom(treeSeed) * 10;
        const x = (seededRandom(treeSeed + 1) - 0.5) * 8; // Closer to center path
        const y = seededRandom(treeSeed + 2) * 0.5;
        
        const rotationY = seededRandom(treeSeed + 3) * Math.PI * 2;
        const scale = 0.6 + seededRandom(treeSeed + 4) * 0.4;
        
        instances.push({
          key: `path_tree_${chunk.id}_${i}`,
          position: [x, y, z] as [number, number, number],
          rotation: [0, rotationY, 0] as [number, number, number],
          scale: [scale, scale, scale] as [number, number, number],
          treeType: Math.floor(seededRandom(treeSeed + 5) * 3)
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize]);

  const createTree = (treeType: number, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => {
    const leafColors = ['#22c55e', '#16a34a', '#15803d']; // Different shades of green
    const leafColor = leafColors[treeType % 3];
    
    return (
      <group position={position} rotation={rotation} scale={scale}>
        {/* Tree trunk */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
          <meshLambertMaterial color="#8b4513" />
        </mesh>
        
        {/* Tree foliage - rounded like in the image */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.8, 8, 6]} />
          <meshLambertMaterial color={leafColor} />
        </mesh>
        
        {/* Additional smaller foliage for variation */}
        {treeType === 1 && (
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshLambertMaterial color={leafColor} />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group>
      {treeInstances.map((instance) => 
        createTree(instance.treeType, instance.position, instance.rotation, instance.scale)
      )}
    </group>
  );
};

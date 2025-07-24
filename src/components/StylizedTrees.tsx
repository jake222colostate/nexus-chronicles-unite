import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FantasyChunkData } from './NewFantasyChunkSystem';
import { Group } from 'three';

interface StylizedTreesProps {
  chunks: FantasyChunkData[];
  chunkSize: number;
}

interface TreeData {
  key: string;
  position: [number, number, number];
  scale: number;
  trunkHeight: number;
  foliageSize: number;
  swayPhase: number;
  opacity: number;
}

// Seeded random function
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const StylizedTree: React.FC<{ tree: TreeData }> = ({ tree }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle swaying animation
      const time = state.clock.getElapsedTime();
      const sway = Math.sin(time * 0.5 + tree.swayPhase) * 0.05;
      groupRef.current.rotation.z = sway;
    }
  });

  return (
    <group
      ref={groupRef}
      position={tree.position}
      scale={tree.scale}
    >
      {/* Tree trunk */}
      <mesh position={[0, tree.trunkHeight * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.4, tree.trunkHeight, 8]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.9}
          metalness={0.0}
          transparent
          opacity={tree.opacity}
        />
      </mesh>
      
      {/* Bright green spherical foliage */}
      <mesh position={[0, tree.trunkHeight + tree.foliageSize * 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[tree.foliageSize, 12, 8]} />
        <meshStandardMaterial
          color="#4CAF50"
          roughness={0.7}
          metalness={0.0}
          transparent
          opacity={tree.opacity}
        />
      </mesh>
      
      {/* Additional foliage layers for fullness */}
      <mesh position={[0.5, tree.trunkHeight + tree.foliageSize * 0.2, 0.3]} castShadow receiveShadow>
        <sphereGeometry args={[tree.foliageSize * 0.7, 10, 6]} />
        <meshStandardMaterial
          color="#66BB6A"
          roughness={0.8}
          metalness={0.0}
          transparent
          opacity={tree.opacity * 0.8}
        />
      </mesh>
      
      <mesh position={[-0.4, tree.trunkHeight + tree.foliageSize * 0.15, -0.2]} castShadow receiveShadow>
        <sphereGeometry args={[tree.foliageSize * 0.6, 8, 6]} />
        <meshStandardMaterial
          color="#66BB6A"
          roughness={0.8}
          metalness={0.0}
          transparent
          opacity={tree.opacity * 0.7}
        />
      </mesh>
    </group>
  );
};

export const StylizedTrees: React.FC<StylizedTreesProps> = ({
  chunks,
  chunkSize
}) => {
  const trees = useMemo(() => {
    const treeData: TreeData[] = [];
    
    chunks.forEach((chunk) => {
      const { worldX, worldZ, opacity, seed } = chunk;
      
      // 1-2 trees per chunk, sparse placement
      const treeCount = seededRandom(seed) > 0.6 ? 2 : 1;
      
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 50;
        
        // Position trees on the sides of the path, avoiding the path itself
        const sideChoice = seededRandom(treeSeed) > 0.5 ? 1 : -1; // Left or right side
        const xOffset = sideChoice * (8 + seededRandom(treeSeed + 1) * 12); // 8-20 units from center
        const zOffset = (seededRandom(treeSeed + 2) - 0.5) * chunkSize * 0.8;
        
        // Tree variations
        const scale = 0.8 + seededRandom(treeSeed + 3) * 0.6; // 0.8 to 1.4 scale
        const trunkHeight = 3 + seededRandom(treeSeed + 4) * 2; // 3-5 units tall
        const foliageSize = 1.5 + seededRandom(treeSeed + 5) * 1; // 1.5-2.5 radius
        
        treeData.push({
          key: `tree_${chunk.id}_${i}`,
          position: [
            worldX + xOffset,
            -2.0 + trunkHeight * 0.1, // Slightly above ground
            worldZ + zOffset
          ],
          scale,
          trunkHeight,
          foliageSize,
          swayPhase: seededRandom(treeSeed + 6) * Math.PI * 2,
          opacity
        });
      }
    });
    
    console.log(`StylizedTrees: Generated ${treeData.length} trees`);
    return treeData;
  }, [chunks, chunkSize]);

  return (
    <group name="StylizedTrees">
      {trees.map((tree) => (
        <StylizedTree key={tree.key} tree={tree} />
      ))}
    </group>
  );
};
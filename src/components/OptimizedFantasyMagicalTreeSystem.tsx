
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface OptimizedFantasyMagicalTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: THREE.Vector3;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const SimpleMagicalTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  seed: number;
  distance: number;
}> = React.memo(({ position, scale, seed, distance }) => {
  const treeRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // LOD - reduce detail based on distance
  const isNear = distance < 50;
  const isMid = distance < 100;
  
  // Skip animation for distant trees
  useFrame((state) => {
    if (!isNear || !treeRef.current) return;
    
    const time = state.clock.elapsedTime * 0.2 + seed;
    treeRef.current.rotation.x = Math.sin(time * 0.3) * 0.01;
    treeRef.current.rotation.z = Math.cos(time * 0.2) * 0.01;
    
    if (glowRef.current && isMid) {
      const glowTime = state.clock.elapsedTime * 0.3 + seed;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(glowTime) * 0.05;
    }
  });

  // Ultra-simplified geometry for distant trees
  if (!isMid) {
    return (
      <mesh position={position} scale={[scale * 0.8, scale * 0.8, scale * 0.8]}>
        <coneGeometry args={[0.6, 1.5, 4]} />
        <meshLambertMaterial color="#2e7d32" />
      </mesh>
    );
  }

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Simplified trunk */}
      <mesh position={[0, 0.5, 0]} castShadow={isNear} receiveShadow={isNear}>
        <cylinderGeometry args={[0.1, 0.12, 1]} />
        <meshLambertMaterial color="#5c3d2e" />
      </mesh>
      
      {/* Single canopy layer */}
      <mesh position={[0, 1, 0]} castShadow={isNear} receiveShadow={isNear}>
        <coneGeometry args={[0.8, 1.2, isNear ? 8 : 4]} />
        <meshLambertMaterial color="#2e7d32" />
      </mesh>
      
      {/* Glow only for near trees */}
      {isNear && (
        <>
          <mesh ref={glowRef} position={[0, 1.2, 0]} scale={[0.8, 0.8, 0.8]}>
            <sphereGeometry args={[0.8, 8, 6]} />
            <meshBasicMaterial 
              color="#64ffda" 
              transparent 
              opacity={0.15}
            />
          </mesh>
          
          <pointLight 
            color="#64ffda" 
            intensity={0.1} 
            distance={4}
            position={[0, 1.3, 0]}
          />
        </>
      )}
    </group>
  );
});

SimpleMagicalTree.displayName = 'SimpleMagicalTree';

export const OptimizedFantasyMagicalTreeSystem: React.FC<OptimizedFantasyMagicalTreeSystemProps> = React.memo(({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const treePositions = useMemo(() => {
    const positions = [];
    
    // Stable chunk processing to prevent re-render loops
    const stableChunks = chunks.slice(0, 8); // Fixed number to prevent changes
    
    stableChunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Calculate distance to chunk
      const chunkDistance = Math.sqrt(
        Math.pow(worldX - playerPosition.x, 2) + 
        Math.pow(worldZ - playerPosition.z, 2)
      );
      
      // Skip distant chunks entirely
      if (chunkDistance > 120) return;
      
      // Reduce tree density for distant chunks
      const maxTrees = chunkDistance > 60 ? 1 : 2;
      const treeCount = 1 + Math.floor(seededRandom(seed + 300) * maxTrees);
      
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91 + 3000;
        
        const side = seededRandom(treeSeed + 10) > 0.5 ? 1 : -1;
        const x = side * (4 + seededRandom(treeSeed) * 3);
        const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.5;
        const scale = 0.7 + seededRandom(treeSeed + 2) * 0.2;
        
        // Calculate distance to player
        const distance = Math.sqrt(
          Math.pow(x - playerPosition.x, 2) + 
          Math.pow(z - playerPosition.z, 2)
        );
        
        // Simple spacing check - reduced for performance
        const validPosition = positions.every(pos => {
          const treeDist = Math.sqrt(
            Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2)
          );
          return treeDist >= 3;
        });
        
        if (validPosition) {
          positions.push({
            x, z, scale, seed: treeSeed,
            chunkId: chunk.id, distance
          });
        }
      }
    });
    
    // Sort by distance and limit total trees
    return positions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 25); // Hard limit to 25 trees total
  }, [chunks.length, chunkSize, Math.floor(playerPosition.x / 10), Math.floor(playerPosition.z / 10)]); // Stable dependencies

  return (
    <group>
      {treePositions.map((pos, index) => (
        <SimpleMagicalTree
          key={`optimized_magical_tree_${pos.chunkId}_${index}`}
          position={[pos.x, 0, pos.z]}
          scale={pos.scale}
          seed={pos.seed}
          distance={pos.distance}
        />
      ))}
    </group>
  );
});

OptimizedFantasyMagicalTreeSystem.displayName = 'OptimizedFantasyMagicalTreeSystem';


import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface RealisticTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const RealisticTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  seed: number;
  treeType: 'oak' | 'pine' | 'birch';
}> = React.memo(({ position, scale, seed, treeType }) => {
  const treeRef = useRef<THREE.Group>(null);
  
  // Gentle swaying animation
  useFrame((state) => {
    if (treeRef.current) {
      const time = state.clock.elapsedTime * 0.5 + seed;
      treeRef.current.rotation.x = Math.sin(time * 0.3) * 0.02;
      treeRef.current.rotation.z = Math.cos(time * 0.2) * 0.015;
    }
  });

  const generateTreeByType = () => {
    switch (treeType) {
      case 'oak':
        return (
          <>
            {/* Thick, gnarled trunk */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
              <meshLambertMaterial color="#654321" />
            </mesh>
            
            {/* Large, rounded canopy */}
            <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
              <sphereGeometry args={[2.2, 12, 8]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
            
            {/* Secondary canopy layers for fullness */}
            <mesh position={[0.8, 3.5, 0.5]} castShadow receiveShadow>
              <sphereGeometry args={[1.5, 10, 6]} />
              <meshLambertMaterial color="#32CD32" />
            </mesh>
            
            <mesh position={[-0.6, 3.0, -0.7]} castShadow receiveShadow>
              <sphereGeometry args={[1.3, 8, 6]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
            
            {/* Branch details */}
            {Array.from({ length: 4 }, (_, i) => {
              const branchSeed = seed + i * 41;
              const angle = (i / 4) * Math.PI * 2;
              const branchX = Math.cos(angle) * 1.5;
              const branchZ = Math.sin(angle) * 1.5;
              
              return (
                <mesh
                  key={i}
                  position={[branchX, 2.5 + seededRandom(branchSeed) * 0.5, branchZ]}
                  rotation={[0, angle, 0.3]}
                  castShadow
                >
                  <cylinderGeometry args={[0.08, 0.12, 1.2]} />
                  <meshLambertMaterial color="#8B4513" />
                </mesh>
              );
            })}
          </>
        );
        
      case 'pine':
        return (
          <>
            {/* Straight trunk */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.25, 4, 8]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            
            {/* Layered pine foliage */}
            {Array.from({ length: 6 }, (_, i) => {
              const layerY = 1.5 + i * 0.6;
              const layerRadius = 2 - i * 0.2;
              
              return (
                <mesh
                  key={i}
                  position={[0, layerY, 0]}
                  castShadow
                  receiveShadow
                >
                  <coneGeometry args={[layerRadius, 1.2, 8]} />
                  <meshLambertMaterial color="#013220" />
                </mesh>
              );
            })}
          </>
        );
        
      case 'birch':
        return (
          <>
            {/* Slender white trunk */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.18, 4, 8]} />
              <meshLambertMaterial color="#F5F5DC" />
            </mesh>
            
            {/* Birch bark texture with dark bands */}
            {Array.from({ length: 3 }, (_, i) => (
              <mesh
                key={i}
                position={[0, 1 + i * 1.2, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.19, 0.19, 0.3, 8]} />
                <meshLambertMaterial color="#2F4F4F" />
              </mesh>
            ))}
            
            {/* Light, airy canopy */}
            <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1.5, 10, 8]} />
              <meshLambertMaterial color="#9ACD32" />
            </mesh>
            
            {/* Smaller foliage clusters */}
            {Array.from({ length: 3 }, (_, i) => {
              const clusterSeed = seed + i * 37;
              const clusterX = (seededRandom(clusterSeed) - 0.5) * 2;
              const clusterZ = (seededRandom(clusterSeed + 1) - 0.5) * 2;
              
              return (
                <mesh
                  key={i}
                  position={[clusterX, 3.2 + seededRandom(clusterSeed + 2) * 0.6, clusterZ]}
                  castShadow
                  receiveShadow
                >
                  <sphereGeometry args={[0.8, 8, 6]} />
                  <meshLambertMaterial color="#ADFF2F" />
                </mesh>
              );
            })}
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {generateTreeByType()}
    </group>
  );
});

RealisticTree.displayName = 'RealisticTree';

export const RealisticTreeSystem: React.FC<RealisticTreeSystemProps> = React.memo(({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const treePositions = useMemo(() => {
    const positions = [];
    
    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate more trees with better distribution
      const treeCount = 4 + Math.floor(seededRandom(seed + 300) * 4);
      
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91 + 3000;
        
        // Better positioning along the path sides
        const side = seededRandom(treeSeed + 10) > 0.5 ? 1 : -1;
        const x = side * (6 + seededRandom(treeSeed) * 8); // 6-14 units from center
        const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        const scale = 0.7 + seededRandom(treeSeed + 2) * 0.6;
        
        // Choose tree type based on seed
        const typeRand = seededRandom(treeSeed + 3);
        let treeType: 'oak' | 'pine' | 'birch';
        if (typeRand < 0.4) treeType = 'oak';
        else if (typeRand < 0.7) treeType = 'pine';
        else treeType = 'birch';
        
        // Check spacing with other trees
        const validPosition = positions.every(pos => {
          const distance = Math.sqrt(
            Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2)
          );
          return distance >= 5;
        });
        
        if (validPosition) {
          positions.push({
            x, z, scale, seed: treeSeed, treeType,
            chunkId: chunk.id
          });
        }
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {treePositions.map((pos, index) => (
        <RealisticTree
          key={`realistic_tree_${pos.chunkId}_${index}`}
          position={[pos.x, 0, pos.z]}
          scale={pos.scale}
          seed={pos.seed}
          treeType={pos.treeType}
        />
      ))}
    </group>
  );
});

RealisticTreeSystem.displayName = 'RealisticTreeSystem';

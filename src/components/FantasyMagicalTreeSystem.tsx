
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyMagicalTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const MagicalTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number; 
  seed: number;
}> = ({ position, scale, seed }) => {
  const treeRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Animate tree sway
  useFrame((state) => {
    if (treeRef.current) {
      const time = state.clock.elapsedTime + seed;
      treeRef.current.rotation.x = Math.sin(time * 0.5) * 0.03;
      treeRef.current.rotation.z = Math.cos(time * 0.3) * 0.02;
    }
    
    if (glowRef.current) {
      const time = state.clock.elapsedTime + seed;
      glowRef.current.material.opacity = 0.2 + Math.sin(time * 2) * 0.1;
    }
  });

  const canopyCount = 3 + Math.floor(seededRandom(seed) * 3);

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.18, 1.5]} />
        <meshLambertMaterial color="#5c3d2e" />
      </mesh>
      
      {/* Canopy layers */}
      {Array.from({ length: canopyCount }, (_, i) => {
        const layerY = 1.2 + i * 0.3;
        const layerScale = 1.3 - i * 0.15;
        const layerSeed = seed + i * 47;
        
        return (
          <group key={i}>
            {/* Main canopy sphere */}
            <mesh 
              position={[
                (seededRandom(layerSeed) - 0.5) * 0.3,
                layerY,
                (seededRandom(layerSeed + 1) - 0.5) * 0.3
              ]} 
              castShadow 
              receiveShadow
              scale={[layerScale, layerScale, layerScale]}
            >
              <icosahedronGeometry args={[0.8, 1]} />
              <meshLambertMaterial color="#2e7d32" />
            </mesh>
          </group>
        );
      })}
      
      {/* Magical glow effect */}
      <mesh 
        ref={glowRef}
        position={[0, 1.8, 0]} 
        scale={[1.5, 1.5, 1.5]}
      >
        <sphereGeometry args={[1.2]} />
        <meshBasicMaterial 
          color="#64ffda" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Point light for magical effect */}
      <pointLight 
        color="#64ffda" 
        intensity={0.3} 
        distance={8}
        position={[0, 2, 0]}
      />
    </group>
  );
};

export const FantasyMagicalTreeSystem: React.FC<FantasyMagicalTreeSystemProps> = ({
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
      
      // Generate trees within specified bounds
      const treeCount = 4 + Math.floor(seededRandom(seed + 300) * 6);
      
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91 + 3000;
        
        // Position trees within X = ±3-8, spacing 3-5 units
        const side = seededRandom(treeSeed + 10) > 0.5 ? 1 : -1;
        const x = side * (3 + seededRandom(treeSeed) * 5);
        const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        const scale = 0.8 + seededRandom(treeSeed + 2) * 0.4;
        
        // Check minimum spacing
        const validPosition = positions.every(pos => {
          const distance = Math.sqrt(
            Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2)
          );
          return distance >= 3;
        });
        
        if (validPosition) {
          positions.push({
            x, z, scale, seed: treeSeed,
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
        <MagicalTree
          key={`magical_tree_${pos.chunkId}_${index}`}
          position={[pos.x, 0, pos.z]}
          scale={pos.scale}
          seed={pos.seed}
        />
      ))}
    </group>
  );
};

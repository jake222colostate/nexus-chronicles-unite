
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyDuskSkybox } from './FantasyDuskSkybox';
import { BoundaryMountainSystem } from './BoundaryMountainSystem';
import { CleanPathSystem } from './CleanPathSystem';
import { ImprovedFantasyLighting } from './ImprovedFantasyLighting';
import * as THREE from 'three';

interface FantasyReferenceEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: THREE.Vector3;
}

export const FantasyReferenceEnvironment: React.FC<FantasyReferenceEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new THREE.Vector3(0, 0, 0)
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Optimized decorative elements with reduced count for better performance
  const decorativeElements = useMemo(() => {
    const elements = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Fewer side trees for better performance
      const treeCount = 1 + Math.floor(Math.sin(seed) * 1);
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (18 + Math.abs(Math.sin(treeSeed) * 8)); // Closer to mountains
        const z = worldZ - (i * 25) - Math.abs(Math.sin(treeSeed + 1) * 12);
        const scale = 0.6 + Math.abs(Math.sin(treeSeed + 2) * 0.3);
        
        elements.push(
          <group key={`tree_${chunk.id}_${i}`} position={[x, -1, z]} scale={[scale, scale, scale]}>
            {/* Simplified tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.3, 2.5, 6]} />
              <meshLambertMaterial color="#4a2c2a" />
            </mesh>
            {/* Simplified tree foliage */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <sphereGeometry args={[1.8, 8, 6]} />
              <meshLambertMaterial color="#4CAF50" />
            </mesh>
          </group>
        );
      }
      
      // Fewer floating crystals for better performance
      const crystalCount = 2 + Math.floor(Math.abs(Math.sin(seed + 100)) * 2);
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 73 + 1000;
        const x = (Math.sin(crystalSeed) * 0.4) * 16;
        const y = 6 + Math.abs(Math.sin(crystalSeed + 1)) * 8;
        const z = worldZ - (i * 18) - Math.abs(Math.sin(crystalSeed + 2) * 8);
        const scale = 0.25 + Math.abs(Math.sin(crystalSeed + 3)) * 0.4;
        
        elements.push(
          <group key={`crystal_${chunk.id}_${i}`} position={[x, y, z]}>
            <mesh>
              <octahedronGeometry args={[scale, 0]} />
              <meshStandardMaterial 
                color="#00FFFF"
                emissive="#00CCCC"
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </mesh>
            <pointLight 
              position={[0, 0, 0]}
              color="#00FFFF"
              intensity={0.3}
              distance={10}
            />
          </group>
        );
      }
    });
    
    return elements;
  }, [chunks]);

  // Simplified ground plane
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -100]} receiveShadow>
        <planeGeometry args={[150, 400]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
    );
  }, []);

  return (
    <group>
      {/* Magical dusk skybox */}
      <FantasyDuskSkybox />
      
      {/* Ground plane */}
      {groundPlane}
      
      {/* Clean, unobstructed path system */}
      <CleanPathSystem chunks={chunks} chunkSize={chunkSize} realm={realm} />
      
      {/* Sharp boundary mountains with collision closer to path */}
      <BoundaryMountainSystem chunks={chunks} chunkSize={chunkSize} realm={realm} />
      
      {/* Optimized lighting system */}
      <ImprovedFantasyLighting />
      
      {/* Reduced decorative elements for better performance */}
      {decorativeElements}
    </group>
  );
};

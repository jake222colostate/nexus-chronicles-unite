
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

  // Generate minimal decorative elements that don't obstruct the path
  const decorativeElements = useMemo(() => {
    const elements = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Side trees (far from path)
      const treeCount = 2 + Math.floor(Math.sin(seed) * 2);
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (15 + Math.abs(Math.sin(treeSeed) * 10)); // 15-25 units from center
        const z = worldZ - (i * 20) - Math.abs(Math.sin(treeSeed + 1) * 15);
        const scale = 0.8 + Math.abs(Math.sin(treeSeed + 2) * 0.4);
        
        elements.push(
          <group key={`tree_${chunk.id}_${i}`} position={[x, -1, z]} scale={[scale, scale, scale]}>
            {/* Tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
              <meshLambertMaterial color="#4a2c2a" />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 4, 0]} castShadow>
              <sphereGeometry args={[2.2, 12, 8]} />
              <meshLambertMaterial color="#4CAF50" />
            </mesh>
          </group>
        );
      }
      
      // Floating crystals (high above path)
      const crystalCount = 3 + Math.floor(Math.abs(Math.sin(seed + 100)) * 3);
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 73 + 1000;
        const x = (Math.sin(crystalSeed) * 0.5) * 20; // Stay within -10 to +10
        const y = 8 + Math.abs(Math.sin(crystalSeed + 1)) * 12; // High above
        const z = worldZ - (i * 15) - Math.abs(Math.sin(crystalSeed + 2) * 10);
        const scale = 0.3 + Math.abs(Math.sin(crystalSeed + 3)) * 0.5;
        
        elements.push(
          <group key={`crystal_${chunk.id}_${i}`} position={[x, y, z]}>
            <mesh>
              <octahedronGeometry args={[scale, 0]} />
              <meshStandardMaterial 
                color="#00FFFF"
                emissive="#00CCCC"
                emissiveIntensity={1.0}
                transparent
                opacity={0.8}
              />
            </mesh>
            <pointLight 
              position={[0, 0, 0]}
              color="#00FFFF"
              intensity={0.5}
              distance={12}
            />
          </group>
        );
      }
    });
    
    return elements;
  }, [chunks]);

  // Ground plane
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -100]} receiveShadow>
        <planeGeometry args={[200, 400]} />
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
      
      {/* Realistic boundary mountains with collision */}
      <BoundaryMountainSystem chunks={chunks} chunkSize={chunkSize} realm={realm} />
      
      {/* Improved lighting system */}
      <ImprovedFantasyLighting />
      
      {/* Decorative elements (trees and crystals away from path) */}
      {decorativeElements}
    </group>
  );
};

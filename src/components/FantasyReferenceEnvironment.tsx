
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

  // Optimized decorative elements with distance-based LOD for far terrain
  const decorativeElements = useMemo(() => {
    const elements = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Calculate distance from player for LOD
      const distanceFromPlayer = Math.abs(worldZ - playerPosition.z);
      const isNearChunk = distanceFromPlayer < 100;
      const isMidChunk = distanceFromPlayer < 300;
      const isFarChunk = distanceFromPlayer < 500;
      
      // Adjust detail level based on distance
      let treeCount = 0;
      let crystalCount = 0;
      
      if (isNearChunk) {
        // Full detail for nearby chunks
        treeCount = 2 + Math.floor(Math.sin(seed) * 2);
        crystalCount = 3 + Math.floor(Math.abs(Math.sin(seed + 100)) * 3);
      } else if (isMidChunk) {
        // Medium detail for mid-distance chunks
        treeCount = 1 + Math.floor(Math.sin(seed) * 1);
        crystalCount = 2 + Math.floor(Math.abs(Math.sin(seed + 100)) * 2);
      } else if (isFarChunk) {
        // Low detail for far chunks - just basic elements
        treeCount = Math.floor(Math.sin(seed) * 1);
        crystalCount = 1 + Math.floor(Math.abs(Math.sin(seed + 100)) * 1);
      }
      
      // Generate trees with LOD
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (18 + Math.abs(Math.sin(treeSeed) * 8));
        const z = worldZ - (i * 25) - Math.abs(Math.sin(treeSeed + 1) * 12);
        const scale = isNearChunk ? 0.6 + Math.abs(Math.sin(treeSeed + 2) * 0.3) : 0.4;
        
        elements.push(
          <group key={`tree_${chunk.id}_${i}`} position={[x, -1, z]} scale={[scale, scale, scale]}>
            {/* Simplified tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow={isNearChunk}>
              <cylinderGeometry args={[0.2, 0.3, 2.5, isNearChunk ? 6 : 4]} />
              <meshLambertMaterial color="#4a2c2a" />
            </mesh>
            {/* Simplified tree foliage */}
            <mesh position={[0, 3.5, 0]} castShadow={isNearChunk}>
              <sphereGeometry args={[1.8, isNearChunk ? 8 : 6, isNearChunk ? 6 : 4]} />
              <meshLambertMaterial color="#4CAF50" />
            </mesh>
          </group>
        );
      }
      
      // Generate crystals with LOD
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 73 + 1000;
        const x = (Math.sin(crystalSeed) * 0.4) * 16;
        const y = 6 + Math.abs(Math.sin(crystalSeed + 1)) * 8;
        const z = worldZ - (i * 18) - Math.abs(Math.sin(crystalSeed + 2) * 8);
        const scale = isNearChunk ? 0.25 + Math.abs(Math.sin(crystalSeed + 3)) * 0.4 : 0.15;
        
        elements.push(
          <group key={`crystal_${chunk.id}_${i}`} position={[x, y, z]}>
            <mesh>
              <octahedronGeometry args={[scale, 0]} />
              <meshStandardMaterial 
                color="#00FFFF"
                emissive="#00CCCC"
                emissiveIntensity={isNearChunk ? 0.8 : 0.4}
                transparent
                opacity={isNearChunk ? 0.7 : 0.5}
              />
            </mesh>
            {isNearChunk && (
              <pointLight 
                position={[0, 0, 0]}
                color="#00FFFF"
                intensity={0.3}
                distance={10}
              />
            )}
          </group>
        );
      }
    });
    
    console.log(`FantasyReferenceEnvironment: Generated ${elements.length} decorative elements for ${chunks.length} chunks`);
    return elements;
  }, [chunks, playerPosition]);

  // Much larger ground plane for far terrain
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -250]} receiveShadow>
        <planeGeometry args={[300, 1000]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
    );
  }, []);

  return (
    <group>
      {/* Magical dusk skybox */}
      <FantasyDuskSkybox />
      
      {/* Much larger ground plane for far terrain */}
      {groundPlane}
      
      {/* Clean, unobstructed path system */}
      <CleanPathSystem chunks={chunks} chunkSize={chunkSize} realm={realm} />
      
      {/* Sharp boundary mountains with collision closer to path */}
      <BoundaryMountainSystem chunks={chunks} chunkSize={chunkSize} realm={realm} />
      
      {/* Optimized lighting system */}
      <ImprovedFantasyLighting />
      
      {/* LOD-based decorative elements for far terrain */}
      {decorativeElements}
    </group>
  );
};

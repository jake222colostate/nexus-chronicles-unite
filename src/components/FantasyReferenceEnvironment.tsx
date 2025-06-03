
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

  // Highly optimized decorative elements with aggressive LOD and culling
  const decorativeElements = useMemo(() => {
    const elements = [];
    
    // Limit total chunks processed for performance
    const maxChunks = 50;
    const processedChunks = chunks.slice(0, maxChunks);
    
    processedChunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Calculate distance from player for aggressive LOD
      const distanceFromPlayer = Math.abs(worldZ - playerPosition.z);
      
      // Much more aggressive culling - only render very close elements
      if (distanceFromPlayer > 150) return;
      
      const isNearChunk = distanceFromPlayer < 50;
      const isMidChunk = distanceFromPlayer < 100;
      
      // Drastically reduced element counts for performance
      let treeCount = 0;
      let crystalCount = 0;
      
      if (isNearChunk) {
        // Minimal trees for near chunks
        treeCount = 1;
        crystalCount = 1;
      } else if (isMidChunk) {
        // Even fewer for mid chunks
        treeCount = Math.floor(Math.sin(seed) * 1);
        crystalCount = Math.floor(Math.abs(Math.sin(seed + 100)) * 1);
      }
      
      // Generate minimal trees with very low geometry
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (18 + Math.abs(Math.sin(treeSeed) * 8));
        const z = worldZ - (i * 35) - Math.abs(Math.sin(treeSeed + 1) * 15);
        const scale = 0.4;
        
        elements.push(
          <group key={`tree_${chunk.id}_${i}`} position={[x, -1, z]} scale={[scale, scale, scale]}>
            {/* Ultra-simplified tree - minimal geometry */}
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 2.5, 4]} />
              <meshLambertMaterial color="#4a2c2a" />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
              <sphereGeometry args={[1.8, 4, 3]} />
              <meshLambertMaterial color="#4CAF50" />
            </mesh>
          </group>
        );
      }
      
      // Generate minimal crystals
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 73 + 1000;
        const x = (Math.sin(crystalSeed) * 0.4) * 16;
        const y = 6 + Math.abs(Math.sin(crystalSeed + 1)) * 8;
        const z = worldZ - (i * 25) - Math.abs(Math.sin(crystalSeed + 2) * 8);
        const scale = 0.15;
        
        elements.push(
          <group key={`crystal_${chunk.id}_${i}`} position={[x, y, z]}>
            <mesh>
              <octahedronGeometry args={[scale, 0]} />
              <meshStandardMaterial 
                color="#00FFFF"
                emissive="#00CCCC"
                emissiveIntensity={isNearChunk ? 0.4 : 0.2}
                transparent
                opacity={0.5}
              />
            </mesh>
            {/* Remove point lights for performance */}
          </group>
        );
      }
    });
    
    console.log(`FantasyReferenceEnvironment: Generated ${elements.length} optimized elements for ${processedChunks.length} chunks`);
    return elements;
  }, [chunks.slice(0, 50), playerPosition.z]); // Only depend on first 50 chunks and Z position

  // Smaller ground plane for better performance
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -150]} receiveShadow>
        <planeGeometry args={[200, 600]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
    );
  }, []);

  return (
    <group>
      {/* Skybox */}
      <FantasyDuskSkybox />
      
      {/* Optimized ground plane */}
      {groundPlane}
      
      {/* Path system */}
      <CleanPathSystem chunks={chunks.slice(0, 30)} chunkSize={chunkSize} realm={realm} />
      
      {/* Mountain system with reduced chunks */}
      <BoundaryMountainSystem chunks={chunks.slice(0, 25)} chunkSize={chunkSize} realm={realm} />
      
      {/* Optimized lighting */}
      <ImprovedFantasyLighting />
      
      {/* Highly optimized decorative elements */}
      {decorativeElements}
    </group>
  );
};

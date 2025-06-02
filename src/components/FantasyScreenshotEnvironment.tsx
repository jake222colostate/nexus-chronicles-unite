
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyScreenshotEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const FantasyScreenshotEnvironment: React.FC<FantasyScreenshotEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const environmentElements = useMemo(() => {
    const elements = [];
    
    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate pink crystalline mountains (background)
      const mountainCount = 2 + Math.floor(seededRandom(seed + 100) * 2);
      
      for (let i = 0; i < mountainCount; i++) {
        const mountainSeed = seed + i * 73 + 1000;
        const x = worldX + (seededRandom(mountainSeed) - 0.5) * chunkSize * 1.5;
        const z = worldZ + (seededRandom(mountainSeed + 1) - 0.5) * chunkSize * 0.3 - 50; // Far background
        const y = 15 + seededRandom(mountainSeed + 2) * 25; // Tall mountains
        
        const scaleX = 8 + seededRandom(mountainSeed + 3) * 12;
        const scaleY = 15 + seededRandom(mountainSeed + 4) * 20;
        const scaleZ = 6 + seededRandom(mountainSeed + 5) * 8;
        
        elements.push(
          <mesh
            key={`mountain_${chunk.id}_${i}`}
            position={[x, y, z]}
            scale={[scaleX, scaleY, scaleZ]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[1, 2, 6]} />
            <meshPhongMaterial 
              color="#E879F9" 
              emissive="#C084FC"
              emissiveIntensity={0.1}
              shininess={30}
            />
          </mesh>
        );
      }
      
      // Generate glowing cyan crystals on mountains
      const crystalCount = 3 + Math.floor(seededRandom(seed + 200) * 4);
      
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 83 + 2000;
        const x = worldX + (seededRandom(crystalSeed) - 0.5) * chunkSize * 1.2;
        const z = worldZ + (seededRandom(crystalSeed + 1) - 0.5) * chunkSize * 0.4 - 30;
        const y = 8 + seededRandom(crystalSeed + 2) * 15;
        
        const scale = 1.5 + seededRandom(crystalSeed + 3) * 2;
        const rotationY = seededRandom(crystalSeed + 4) * Math.PI * 2;
        
        elements.push(
          <group key={`crystal_${chunk.id}_${i}`} position={[x, y, z]} rotation={[0, rotationY, 0]}>
            <mesh scale={[scale, scale * 2, scale]} castShadow>
              <octahedronGeometry args={[1, 0]} />
              <meshPhongMaterial 
                color="#00FFFF" 
                emissive="#00CCCC"
                emissiveIntensity={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Crystal glow effect */}
            <pointLight 
              color="#00FFFF" 
              intensity={0.5} 
              distance={20} 
            />
          </group>
        );
      }
      
      // Generate lush green trees
      const treeCount = 4 + Math.floor(seededRandom(seed + 300) * 6);
      
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91 + 3000;
        const x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.8;
        const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
        const y = 0;
        
        const trunkHeight = 1.5 + seededRandom(treeSeed + 2) * 1;
        const canopyScale = 1.5 + seededRandom(treeSeed + 3) * 1;
        
        elements.push(
          <group key={`tree_${chunk.id}_${i}`} position={[x, y, z]}>
            {/* Tree trunk */}
            <mesh position={[0, trunkHeight/2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, trunkHeight, 8]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            {/* Tree canopy */}
            <mesh position={[0, trunkHeight + canopyScale/2, 0]} castShadow>
              <sphereGeometry args={[canopyScale, 8, 6]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
          </group>
        );
      }
      
      // Generate stone pathway tiles
      if (Math.abs(worldX) < 3) { // Only along the center path
        const pathTileCount = Math.ceil(chunkSize / 4);
        
        for (let i = 0; i < pathTileCount; i++) {
          const tileZ = worldZ - (i * 4);
          
          elements.push(
            <mesh
              key={`path_${chunk.id}_${i}`}
              position={[0, -0.05, tileZ]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[1.5, 1.8, 0.2, 8]} />
              <meshLambertMaterial color="#CD853F" />
            </mesh>
          );
        }
      }
      
      // Generate magical floating particles
      const particleCount = 8 + Math.floor(seededRandom(seed + 400) * 12);
      
      for (let i = 0; i < particleCount; i++) {
        const particleSeed = seed + i * 97 + 4000;
        const x = worldX + (seededRandom(particleSeed) - 0.5) * chunkSize;
        const z = worldZ + (seededRandom(particleSeed + 1) - 0.5) * chunkSize;
        const y = 3 + seededRandom(particleSeed + 2) * 8;
        
        const scale = 0.1 + seededRandom(particleSeed + 3) * 0.2;
        
        elements.push(
          <mesh
            key={`particle_${chunk.id}_${i}`}
            position={[x, y, z]}
            scale={[scale, scale, scale]}
          >
            <sphereGeometry args={[1, 6, 4]} />
            <meshPhongMaterial 
              color="#FFFFFF" 
              emissive="#FFFFFF"
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      }
    });
    
    return elements;
  }, [chunks, chunkSize]);

  return (
    <group>
      {environmentElements}
      
      {/* Mystical Portal at distance */}
      <group position={[0, 2, -100]}>
        <mesh>
          <torusGeometry args={[3, 0.5, 16, 100]} />
          <meshPhongMaterial 
            color="#8B5CF6" 
            emissive="#7C3AED"
            emissiveIntensity={0.4}
          />
        </mesh>
        <pointLight 
          color="#8B5CF6" 
          intensity={1} 
          distance={30} 
        />
      </group>
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#4C1D95', 20, 150]} />
    </group>
  );
};

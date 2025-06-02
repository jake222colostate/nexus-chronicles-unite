
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
      
      // Generate large crystalline mountains (background) - more detailed and angular
      const mountainCount = 1 + Math.floor(seededRandom(seed + 100) * 2);
      
      for (let i = 0; i < mountainCount; i++) {
        const mountainSeed = seed + i * 73 + 1000;
        const x = worldX + (seededRandom(mountainSeed) - 0.5) * chunkSize * 2;
        const z = worldZ + (seededRandom(mountainSeed + 1) - 0.5) * chunkSize * 0.2 - 80; // Further back
        const y = 25 + seededRandom(mountainSeed + 2) * 35; // Much taller
        
        const scaleX = 15 + seededRandom(mountainSeed + 3) * 20;
        const scaleY = 25 + seededRandom(mountainSeed + 4) * 30;
        const scaleZ = 10 + seededRandom(mountainSeed + 5) * 15;
        
        // Main crystalline mountain with angular geometry
        elements.push(
          <group key={`mountain_${chunk.id}_${i}`} position={[x, y, z]}>
            {/* Primary mountain peak - sharp and angular */}
            <mesh
              scale={[scaleX, scaleY, scaleZ]}
              castShadow
              receiveShadow
            >
              <octahedronGeometry args={[1, 2]} />
              <meshPhongMaterial 
                color="#E879F9" 
                emissive="#C084FC"
                emissiveIntensity={0.15}
                shininess={80}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Secondary crystalline formations */}
            <mesh
              position={[scaleX * 0.3, -scaleY * 0.2, scaleZ * 0.2]}
              scale={[scaleX * 0.6, scaleY * 0.7, scaleZ * 0.8]}
              castShadow
            >
              <octahedronGeometry args={[1, 1]} />
              <meshPhongMaterial 
                color="#D946EF" 
                emissive="#C084FC"
                emissiveIntensity={0.1}
                shininess={60}
              />
            </mesh>
            
            <mesh
              position={[-scaleX * 0.4, -scaleY * 0.3, -scaleZ * 0.1]}
              scale={[scaleX * 0.5, scaleY * 0.6, scaleZ * 0.7]}
              castShadow
            >
              <octahedronGeometry args={[1, 1]} />
              <meshPhongMaterial 
                color="#F472B6" 
                emissive="#C084FC"
                emissiveIntensity={0.12}
                shininess={70}
              />
            </mesh>
          </group>
        );
      }
      
      // Generate cyan diamond crystals embedded in mountains
      const crystalCount = 4 + Math.floor(seededRandom(seed + 200) * 6);
      
      for (let i = 0; i < crystalCount; i++) {
        const crystalSeed = seed + i * 83 + 2000;
        const x = worldX + (seededRandom(crystalSeed) - 0.5) * chunkSize * 1.8;
        const z = worldZ + (seededRandom(crystalSeed + 1) - 0.5) * chunkSize * 0.3 - 60;
        const y = 15 + seededRandom(crystalSeed + 2) * 25;
        
        const scale = 2 + seededRandom(crystalSeed + 3) * 3;
        const rotationY = seededRandom(crystalSeed + 4) * Math.PI * 2;
        const rotationZ = (seededRandom(crystalSeed + 5) - 0.5) * Math.PI * 0.3;
        
        elements.push(
          <group key={`crystal_${chunk.id}_${i}`} position={[x, y, z]} rotation={[0, rotationY, rotationZ]}>
            <mesh scale={[scale, scale * 2.5, scale]} castShadow>
              <octahedronGeometry args={[1, 0]} />
              <meshPhongMaterial 
                color="#00FFFF" 
                emissive="#00E5E5"
                emissiveIntensity={0.4}
                transparent
                opacity={0.85}
                shininess={100}
              />
            </mesh>
            {/* Intense crystal glow */}
            <pointLight 
              color="#00FFFF" 
              intensity={1.2} 
              distance={30} 
            />
          </group>
        );
      }
      
      // Generate lush, detailed trees lining the path
      const treeCount = 6 + Math.floor(seededRandom(seed + 300) * 8);
      
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 91 + 3000;
        const side = seededRandom(treeSeed + 10) > 0.5 ? -1 : 1;
        const x = side * (8 + seededRandom(treeSeed) * 12); // Line the path
        const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.9;
        const y = 0;
        
        const trunkHeight = 2 + seededRandom(treeSeed + 2) * 1.5;
        const canopyScale = 2.5 + seededRandom(treeSeed + 3) * 2;
        
        elements.push(
          <group key={`tree_${chunk.id}_${i}`} position={[x, y, z]}>
            {/* Tree trunk - more detailed */}
            <mesh position={[0, trunkHeight/2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.6, trunkHeight, 12]} />
              <meshLambertMaterial color="#654321" />
            </mesh>
            
            {/* Main canopy - fuller and more natural */}
            <mesh position={[0, trunkHeight + canopyScale/3, 0]} castShadow receiveShadow>
              <sphereGeometry args={[canopyScale, 12, 8]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
            
            {/* Secondary canopy layers for depth */}
            <mesh position={[canopyScale * 0.3, trunkHeight + canopyScale/2, canopyScale * 0.2]} castShadow>
              <sphereGeometry args={[canopyScale * 0.7, 10, 6]} />
              <meshLambertMaterial color="#32CD32" />
            </mesh>
            
            <mesh position={[-canopyScale * 0.2, trunkHeight + canopyScale/4, -canopyScale * 0.3]} castShadow>
              <sphereGeometry args={[canopyScale * 0.6, 8, 6]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
            
            {/* Small branch details */}
            <mesh position={[canopyScale * 0.6, trunkHeight + canopyScale/3, 0]} castShadow>
              <sphereGeometry args={[canopyScale * 0.4, 6, 4]} />
              <meshLambertMaterial color="#006400" />
            </mesh>
          </group>
        );
      }
      
      // Generate organic stone pathway - more natural and detailed
      if (Math.abs(worldX) < 4) { // Path down the center
        const pathStoneCount = Math.ceil(chunkSize / 3);
        
        for (let i = 0; i < pathStoneCount; i++) {
          const stoneSeed = seed + i * 127 + 5000;
          const baseZ = worldZ - (i * 3);
          const stoneCount = 2 + Math.floor(seededRandom(stoneSeed) * 3);
          
          for (let j = 0; j < stoneCount; j++) {
            const stoneX = (seededRandom(stoneSeed + j) - 0.5) * 6;
            const stoneZ = baseZ + (seededRandom(stoneSeed + j + 10) - 0.5) * 2;
            const stoneScale = 1.2 + seededRandom(stoneSeed + j + 20) * 1.8;
            const stoneHeight = 0.15 + seededRandom(stoneSeed + j + 30) * 0.2;
            
            elements.push(
              <mesh
                key={`pathstone_${chunk.id}_${i}_${j}`}
                position={[stoneX, stoneHeight/2, stoneZ]}
                rotation={[0, seededRandom(stoneSeed + j + 40) * Math.PI * 2, 0]}
                castShadow
                receiveShadow
              >
                <cylinderGeometry args={[stoneScale, stoneScale * 1.1, stoneHeight, 8]} />
                <meshLambertMaterial color="#CD853F" />
              </mesh>
            );
          }
        }
      }
      
      // Enhanced magical floating particles with varied sizes and colors
      const particleCount = 12 + Math.floor(seededRandom(seed + 400) * 16);
      
      for (let i = 0; i < particleCount; i++) {
        const particleSeed = seed + i * 97 + 4000;
        const x = worldX + (seededRandom(particleSeed) - 0.5) * chunkSize * 1.2;
        const z = worldZ + (seededRandom(particleSeed + 1) - 0.5) * chunkSize;
        const y = 2 + seededRandom(particleSeed + 2) * 12;
        
        const scale = 0.08 + seededRandom(particleSeed + 3) * 0.15;
        const colorChoice = seededRandom(particleSeed + 4);
        const particleColor = colorChoice > 0.7 ? "#00FFFF" : colorChoice > 0.4 ? "#FFFFFF" : "#E879F9";
        
        elements.push(
          <mesh
            key={`particle_${chunk.id}_${i}`}
            position={[x, y, z]}
            scale={[scale, scale, scale]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshPhongMaterial 
              color={particleColor} 
              emissive={particleColor}
              emissiveIntensity={0.9}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      }
      
      // Add atmospheric mist/fog effects
      const mistCount = 3 + Math.floor(seededRandom(seed + 500) * 4);
      
      for (let i = 0; i < mistCount; i++) {
        const mistSeed = seed + i * 113 + 5000;
        const x = worldX + (seededRandom(mistSeed) - 0.5) * chunkSize;
        const z = worldZ + (seededRandom(mistSeed + 1) - 0.5) * chunkSize * 0.8;
        const y = 1 + seededRandom(mistSeed + 2) * 4;
        
        const scale = 8 + seededRandom(mistSeed + 3) * 12;
        
        elements.push(
          <mesh
            key={`mist_${chunk.id}_${i}`}
            position={[x, y, z]}
            scale={[scale, 2, scale]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial 
              color="#8B5CF6" 
              transparent
              opacity={0.05}
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
      
      {/* Enhanced Mystical Portal - matching reference image */}
      <group position={[0, 3, -120]}>
        {/* Portal archway structure */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[4, 0.8, 12, 32]} />
          <meshPhongMaterial 
            color="#6B46C1" 
            emissive="#7C3AED"
            emissiveIntensity={0.3}
            shininess={50}
          />
        </mesh>
        
        {/* Portal base pillars */}
        <mesh position={[-3.5, -2, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 4, 8]} />
          <meshPhongMaterial color="#4C1D95" />
        </mesh>
        
        <mesh position={[3.5, -2, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 4, 8]} />
          <meshPhongMaterial color="#4C1D95" />
        </mesh>
        
        {/* Portal energy effect */}
        <mesh>
          <torusGeometry args={[3.2, 0.2, 8, 24]} />
          <meshBasicMaterial 
            color="#00FFFF" 
            transparent
            opacity={0.6}
          />
        </mesh>
        
        {/* Portal glow */}
        <pointLight 
          color="#8B5CF6" 
          intensity={1.5} 
          distance={40} 
        />
        
        <pointLight 
          color="#00FFFF" 
          intensity={0.8} 
          distance={25} 
        />
      </group>
      
      {/* Enhanced atmospheric lighting */}
      <ambientLight intensity={0.4} color="#E6E6FA" />
      <directionalLight
        position={[30, 60, 30]}
        intensity={0.8}
        color="#DDA0DD"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={1200}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      
      {/* Additional atmospheric lights */}
      <directionalLight
        position={[-20, 40, 20]}
        intensity={0.3}
        color="#FF69B4"
      />
      
      <directionalLight
        position={[15, 35, -15]}
        intensity={0.25}
        color="#00FFFF"
      />
      
      {/* Dense atmospheric fog matching the reference */}
      <fog attach="fog" args={['#4C1D95', 15, 200]} />
    </group>
  );
};

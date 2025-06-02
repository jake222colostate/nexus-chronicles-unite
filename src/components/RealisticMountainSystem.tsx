
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface RealisticMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const DetailedMountain: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  scale: number;
  side: 'left' | 'right';
  isBackground?: boolean;
}> = ({ position, seed, scale, side, isBackground = false }) => {
  
  // Create highly detailed mountain geometry with realistic terrain features
  const createDetailedMountainGeometry = () => {
    const geometry = new THREE.ConeGeometry(15, 40, 32, 8); // Much higher resolution
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Apply multiple layers of noise for realistic mountain shapes
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      const heightFactor = (y + 20) / 40; // Normalized height (0 to 1)
      const distance = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x);
      
      // Large scale terrain features
      const largeNoise = seededRandom(seed + Math.floor(angle * 10) + Math.floor(distance * 2)) - 0.5;
      
      // Medium scale ridges and valleys
      const mediumNoise = seededRandom(seed + x * 0.1 + z * 0.1 + 1000) - 0.5;
      
      // Fine detail texture
      const fineNoise = seededRandom(seed + x * 0.5 + z * 0.5 + 2000) - 0.5;
      
      // Create ridge lines running down the mountain
      const ridgePattern = Math.sin(angle * 6 + seed) * 0.3;
      
      // Apply noise with varying intensity based on height
      const totalNoise = (
        largeNoise * 6 * heightFactor +
        mediumNoise * 3 * heightFactor +
        fineNoise * 1.5 * heightFactor +
        ridgePattern * 2 * heightFactor
      );
      
      // Modify position
      const noiseDirection = new THREE.Vector3(x, 0, z).normalize();
      vertices[i] += noiseDirection.x * totalNoise;
      vertices[i + 2] += noiseDirection.z * totalNoise;
      
      // Add vertical variation for cliff faces and overhangs
      if (heightFactor > 0.4) {
        vertices[i + 1] += (seededRandom(seed + x * 0.3 + z * 0.3 + 3000) - 0.5) * 8 * heightFactor;
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  const createRockFormation = (offsetX: number, offsetY: number, offsetZ: number, formationScale: number, formationSeed: number) => {
    const formations = [];
    const rockCount = 3 + Math.floor(seededRandom(formationSeed) * 5);
    
    for (let i = 0; i < rockCount; i++) {
      const rockSeed = formationSeed + i * 91;
      const rockX = offsetX + (seededRandom(rockSeed) - 0.5) * 8;
      const rockY = offsetY + seededRandom(rockSeed + 1) * 5;
      const rockZ = offsetZ + (seededRandom(rockSeed + 2) - 0.5) * 6;
      const rockScale = formationScale * (0.5 + seededRandom(rockSeed + 3) * 1.0);
      
      formations.push(
        <mesh
          key={i}
          position={[rockX, rockY, rockZ]}
          rotation={[
            (seededRandom(rockSeed + 4) - 0.5) * 0.8,
            seededRandom(rockSeed + 5) * Math.PI * 2,
            (seededRandom(rockSeed + 6) - 0.5) * 0.6
          ]}
          scale={[rockScale, rockScale * 0.8, rockScale]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[2]} />
          <meshLambertMaterial color="#4A5568" />
        </mesh>
      );
    }
    
    return formations;
  };

  const baseColor = isBackground ? "#3A4A5A" : "#4A5568";
  const peakColor = isBackground ? "#2D3A4A" : "#2D3748";
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main highly detailed mountain */}
      <mesh castShadow receiveShadow>
        <primitive object={createDetailedMountainGeometry()} />
        <meshLambertMaterial color={baseColor} />
      </mesh>
      
      {/* Multiple secondary peaks for complex silhouette */}
      {Array.from({ length: 5 + Math.floor(seededRandom(seed + 50) * 3) }, (_, i) => {
        const peakSeed = seed + i * 73;
        const peakAngle = (i / 8) * Math.PI * 2 + seededRandom(peakSeed) * 0.5;
        const peakDistance = 8 + seededRandom(peakSeed + 1) * 6;
        const peakX = Math.cos(peakAngle) * peakDistance;
        const peakZ = Math.sin(peakAngle) * peakDistance;
        const peakY = 20 + seededRandom(peakSeed + 2) * 20;
        const peakScale = 0.4 + seededRandom(peakSeed + 3) * 0.6;
        
        return (
          <mesh
            key={i}
            position={[peakX, peakY, peakZ]}
            rotation={[
              (seededRandom(peakSeed + 4) - 0.5) * 0.3,
              seededRandom(peakSeed + 5) * Math.PI * 2,
              (seededRandom(peakSeed + 6) - 0.5) * 0.2
            ]}
            scale={[peakScale, peakScale, peakScale]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[6, 15, 16]} />
            <meshLambertMaterial color={peakColor} />
          </mesh>
        );
      })}
      
      {/* Detailed rock formations at various elevations */}
      {createRockFormation(0, 10, 0, 1.2, seed + 1000)}
      {createRockFormation(-8, 15, 5, 0.8, seed + 2000)}
      {createRockFormation(6, 12, -4, 1.0, seed + 3000)}
      {createRockFormation(-3, 25, -8, 0.6, seed + 4000)}
      
      {/* Layered mountain base with natural slopes */}
      <mesh position={[0, -8, 0]} receiveShadow>
        <cylinderGeometry args={[18, 25, 16, 24]} />
        <meshLambertMaterial color="#2A2458" />
      </mesh>
      
      <mesh position={[0, -15, 0]} receiveShadow>
        <cylinderGeometry args={[25, 35, 14, 20]} />
        <meshLambertMaterial color="#1A1A3A" />
      </mesh>
      
      {/* Snow caps and ice formations on higher peaks */}
      {Array.from({ length: 3 + Math.floor(seededRandom(seed + 5000) * 2) }, (_, i) => {
        const snowSeed = seed + i * 123 + 6000;
        const snowAngle = (i / 5) * Math.PI * 2;
        const snowDistance = 4 + seededRandom(snowSeed) * 6;
        const snowX = Math.cos(snowAngle) * snowDistance;
        const snowZ = Math.sin(snowAngle) * snowDistance;
        const snowY = 25 + seededRandom(snowSeed + 1) * 15;
        const snowScale = 0.8 + seededRandom(snowSeed + 2) * 0.8;
        
        return (
          <mesh
            key={i}
            position={[snowX, snowY, snowZ]}
            scale={[snowScale, snowScale * 0.6, snowScale]}
            castShadow
          >
            <sphereGeometry args={[3, 12, 8]} />
            <meshLambertMaterial color="#F7FAFC" />
          </mesh>
        );
      })}
      
      {/* Cliff faces and vertical rock walls */}
      {Array.from({ length: 4 }, (_, i) => {
        const cliffSeed = seed + i * 157 + 7000;
        const cliffAngle = (i / 4) * Math.PI * 2;
        const cliffX = Math.cos(cliffAngle) * 12;
        const cliffZ = Math.sin(cliffAngle) * 12;
        const cliffHeight = 15 + seededRandom(cliffSeed) * 10;
        
        return (
          <mesh
            key={i}
            position={[cliffX, cliffHeight / 2, cliffZ]}
            rotation={[0, cliffAngle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[8, cliffHeight, 3]} />
            <meshLambertMaterial color="#5A6575" />
          </mesh>
        );
      })}
    </group>
  );
};

export const RealisticMountainSystem: React.FC<RealisticMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainPositions = useMemo(() => {
    const positions = [];
    
    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Close foreground mountains (more detailed, larger)
      const foregroundLeftCount = 1 + Math.floor(seededRandom(seed + 100) * 2);
      for (let i = 0; i < foregroundLeftCount; i++) {
        const mountainSeed = seed + i * 67 + 1000;
        const x = -35 - seededRandom(mountainSeed) * 15; // -35 to -50
        const z = worldZ - (i * 60) - seededRandom(mountainSeed + 1) * 30;
        const scale = 1.5 + seededRandom(mountainSeed + 2) * 0.8;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'left' as const, isBackground: false
        });
      }
      
      const foregroundRightCount = 1 + Math.floor(seededRandom(seed + 200) * 2);
      for (let i = 0; i < foregroundRightCount; i++) {
        const mountainSeed = seed + i * 67 + 2000;
        const x = 35 + seededRandom(mountainSeed) * 15; // +35 to +50
        const z = worldZ - (i * 60) - seededRandom(mountainSeed + 1) * 30;
        const scale = 1.5 + seededRandom(mountainSeed + 2) * 0.8;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'right' as const, isBackground: false
        });
      }
      
      // Mid-distance mountains
      const midLeftCount = 2 + Math.floor(seededRandom(seed + 300) * 2);
      for (let i = 0; i < midLeftCount; i++) {
        const mountainSeed = seed + i * 67 + 3000;
        const x = -60 - seededRandom(mountainSeed) * 25; // -60 to -85
        const z = worldZ - (i * 80) - seededRandom(mountainSeed + 1) * 40;
        const scale = 1.8 + seededRandom(mountainSeed + 2) * 1.0;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'left' as const, isBackground: false
        });
      }
      
      const midRightCount = 2 + Math.floor(seededRandom(seed + 400) * 2);
      for (let i = 0; i < midRightCount; i++) {
        const mountainSeed = seed + i * 67 + 4000;
        const x = 60 + seededRandom(mountainSeed) * 25; // +60 to +85
        const z = worldZ - (i * 80) - seededRandom(mountainSeed + 1) * 40;
        const scale = 1.8 + seededRandom(mountainSeed + 2) * 1.0;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: 'right' as const, isBackground: false
        });
      }
      
      // Distant background mountains (largest, most atmospheric)
      const backgroundCount = 3 + Math.floor(seededRandom(seed + 500) * 3);
      for (let i = 0; i < backgroundCount; i++) {
        const mountainSeed = seed + i * 67 + 5000;
        const x = (seededRandom(mountainSeed) - 0.5) * 200; // -100 to +100
        const z = worldZ - 150 - (i * 100) - seededRandom(mountainSeed + 1) * 50;
        const scale = 2.5 + seededRandom(mountainSeed + 2) * 1.5;
        
        positions.push({
          x, y: 0, z, scale, seed: mountainSeed,
          chunkId: chunk.id, side: seededRandom(mountainSeed + 3) > 0.5 ? 'left' : 'right' as const, 
          isBackground: true
        });
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainPositions.map((pos, index) => (
        <DetailedMountain
          key={`detailed_mountain_${pos.chunkId}_${pos.side}_${index}`}
          position={[pos.x, pos.y, pos.z]}
          seed={pos.seed}
          scale={pos.scale}
          side={pos.side}
          isBackground={pos.isBackground}
        />
      ))}
    </group>
  );
};

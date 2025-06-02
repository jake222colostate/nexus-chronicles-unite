
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface ProceduralMountainTerrainProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Multi-octave noise function for realistic terrain
const generateNoise = (x: number, z: number, seed: number, octaves: number = 4) => {
  let value = 0;
  let amplitude = 1;
  let frequency = 0.01;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    const noiseX = x * frequency + seed;
    const noiseZ = z * frequency + seed;
    
    // Simple noise based on seeded random
    const noise = seededRandom(Math.floor(noiseX) * 73856093 + Math.floor(noiseZ) * 19349663 + seed);
    value += (noise - 0.5) * 2 * amplitude;
    
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
};

const TerrainChunk: React.FC<{
  position: [number, number, number];
  size: number;
  resolution: number;
  seed: number;
  isBackground?: boolean;
}> = ({ position, size, resolution, seed, isBackground = false }) => {
  
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Generate height data
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i] + position[0];
      const z = vertices[i + 2] + position[2];
      
      // Multiple noise layers for realistic terrain
      const baseHeight = generateNoise(x, z, seed, 6) * 60;
      const ridgeNoise = generateNoise(x * 0.5, z * 0.5, seed + 1000, 3) * 25;
      const detailNoise = generateNoise(x * 2, z * 2, seed + 2000, 2) * 8;
      
      // Create mountain ridges and valleys
      const ridgePattern = Math.abs(generateNoise(x * 0.3, z * 0.3, seed + 3000, 1)) * 40;
      
      // Combine all noise layers
      const finalHeight = Math.max(0, baseHeight + ridgeNoise + detailNoise + ridgePattern);
      
      vertices[i + 1] = finalHeight;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, [position, size, resolution, seed]);

  // Create realistic terrain material with multiple textures
  const terrainMaterial = useMemo(() => {
    // Create a canvas texture for the terrain
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Generate procedural rock texture
    const imageData = ctx.createImageData(512, 512);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % 512;
      const y = Math.floor((i / 4) / 512);
      
      const noise = generateNoise(x * 0.1, y * 0.1, seed + 5000, 3);
      const rockColor = 80 + noise * 60; // Rock gray variations
      const grassMix = Math.max(0, generateNoise(x * 0.05, y * 0.05, seed + 6000, 2)) * 100;
      
      // Mix rock and grass colors
      const r = Math.floor(rockColor + grassMix * 0.1);
      const g = Math.floor(rockColor + grassMix * 0.3);
      const b = Math.floor(rockColor * 0.8);
      
      imageData.data[i] = Math.min(255, Math.max(0, r));
      imageData.data[i + 1] = Math.min(255, Math.max(0, g));
      imageData.data[i + 2] = Math.min(255, Math.max(0, b));
      imageData.data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    const baseColor = isBackground ? "#3A4A5A" : "#4A5568";
    
    return new THREE.MeshLambertMaterial({
      map: texture,
      color: baseColor
    });
  }, [seed, isBackground]);

  return (
    <mesh 
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]} 
      castShadow 
      receiveShadow
    >
      <primitive object={terrainGeometry} />
      <primitive object={terrainMaterial} />
    </mesh>
  );
};

export const ProceduralMountainTerrain: React.FC<ProceduralMountainTerrainProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const terrainChunks = useMemo(() => {
    const terrainPieces = [];
    
    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Main terrain chunk for this area
      terrainPieces.push({
        position: [worldX, 0, worldZ] as [number, number, number],
        size: chunkSize,
        resolution: 32,
        seed: seed,
        type: 'main',
        chunkId: chunk.id
      });
      
      // Left mountain range
      terrainPieces.push({
        position: [worldX - 80, 0, worldZ] as [number, number, number],
        size: chunkSize * 2,
        resolution: 24,
        seed: seed + 1000,
        type: 'left-mountains',
        chunkId: chunk.id
      });
      
      // Right mountain range  
      terrainPieces.push({
        position: [worldX + 80, 0, worldZ] as [number, number, number],
        size: chunkSize * 2,
        resolution: 24,
        seed: seed + 2000,
        type: 'right-mountains',
        chunkId: chunk.id
      });
      
      // Background mountains
      terrainPieces.push({
        position: [worldX, 0, worldZ - 150] as [number, number, number],
        size: chunkSize * 3,
        resolution: 20,
        seed: seed + 3000,
        type: 'background',
        chunkId: chunk.id,
        isBackground: true
      });
    });
    
    return terrainPieces;
  }, [chunks, chunkSize]);

  return (
    <group>
      {terrainChunks.map((terrain, index) => (
        <TerrainChunk
          key={`terrain_${terrain.chunkId}_${terrain.type}_${index}`}
          position={terrain.position}
          size={terrain.size}
          resolution={terrain.resolution}
          seed={terrain.seed}
          isBackground={terrain.isBackground}
        />
      ))}
    </group>
  );
};

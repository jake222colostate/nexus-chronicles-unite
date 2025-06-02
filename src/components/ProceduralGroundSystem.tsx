
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface ProceduralGroundSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateDetailedNoise = (x: number, z: number, seed: number) => {
  let noise = seededRandom(Math.floor(x * 10) * 73856093 + Math.floor(z * 10) * 19349663 + seed);
  noise += seededRandom(Math.floor(x * 50) * 73856093 + Math.floor(z * 50) * 19349663 + seed + 1000) * 0.5;
  noise += seededRandom(Math.floor(x * 200) * 73856093 + Math.floor(z * 200) * 19349663 + seed + 2000) * 0.25;
  return noise / 1.75;
};

const GroundChunk: React.FC<{
  position: [number, number, number];
  size: number;
  seed: number;
}> = ({ position, size, seed }) => {
  
  const groundGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size, size, 64, 64);
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Add subtle height variation to ground
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i] + position[0];
      const z = vertices[i + 2] + position[2];
      
      // Very subtle ground undulation
      const heightVariation = generateDetailedNoise(x * 0.1, z * 0.1, seed) * 2;
      vertices[i + 1] = Math.max(-1, heightVariation);
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, [position, size, seed]);

  const groundMaterial = useMemo(() => {
    // Create detailed grass/dirt texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(256, 256);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % 256;
      const y = Math.floor((i / 4) / 256);
      
      const grassNoise = generateDetailedNoise(x * 0.2, y * 0.2, seed) * 0.8;
      const dirtNoise = generateDetailedNoise(x * 0.5, y * 0.5, seed + 1000) * 0.6;
      
      // Mix grass and dirt colors
      const grassR = 45 + grassNoise * 30;
      const grassG = 75 + grassNoise * 40;
      const grassB = 35 + grassNoise * 20;
      
      const dirtR = 101 + dirtNoise * 40;
      const dirtG = 67 + dirtNoise * 30;
      const dirtB = 33 + dirtNoise * 20;
      
      // Blend based on noise
      const blend = Math.max(0, generateDetailedNoise(x * 0.1, y * 0.1, seed + 2000));
      
      const r = Math.floor(grassR * (1 - blend) + dirtR * blend);
      const g = Math.floor(grassG * (1 - blend) + dirtG * blend);
      const b = Math.floor(grassB * (1 - blend) + dirtB * blend);
      
      imageData.data[i] = Math.min(255, Math.max(0, r));
      imageData.data[i + 1] = Math.min(255, Math.max(0, g));
      imageData.data[i + 2] = Math.min(255, Math.max(0, b));
      imageData.data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    
    return new THREE.MeshLambertMaterial({
      map: texture
    });
  }, [seed]);

  return (
    <mesh 
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow
    >
      <primitive object={groundGeometry} />
      <primitive object={groundMaterial} />
    </mesh>
  );
};

export const ProceduralGroundSystem: React.FC<ProceduralGroundSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const groundChunks = useMemo(() => {
    const pieces = [];
    
    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Main ground plane for this chunk
      pieces.push({
        position: [worldX, -1.5, worldZ] as [number, number, number],
        size: chunkSize,
        seed: seed,
        chunkId: chunk.id
      });
    });
    
    return pieces;
  }, [chunks, chunkSize]);

  return (
    <group>
      {groundChunks.map((ground, index) => (
        <GroundChunk
          key={`ground_${ground.chunkId}_${index}`}
          position={ground.position}
          size={ground.size}
          seed={ground.seed}
        />
      ))}
    </group>
  );
};

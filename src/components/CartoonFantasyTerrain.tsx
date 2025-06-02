
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ChunkData } from './ChunkSystem';

interface CartoonFantasyTerrainProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const CartoonFantasyTerrain: React.FC<CartoonFantasyTerrainProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Create cartoon-style gradient texture
  const createCartoonTerrainTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base vibrant green gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#4ADE80'); // Bright green
    gradient.addColorStop(0.5, '#22C55E'); // Medium green
    gradient.addColorStop(1, '#16A34A'); // Darker green
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add colorful flower spots
    const colors = ['#FF69B4', '#FFB347', '#87CEEB', '#DDA0DD', '#98FB98'];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 3 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add white center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  };

  const terrainTexture = useMemo(() => createCartoonTerrainTexture(), []);

  return (
    <group>
      {chunks.map(chunk => {
        // Create rolling hills with noise
        const segments = 32;
        const geometry = new THREE.PlaneGeometry(chunkSize, chunkSize, segments, segments);
        const positions = geometry.attributes.position;
        
        // Add rolling hill displacement
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i) + chunk.worldX;
          const z = positions.getZ(i) + chunk.worldZ;
          
          // Multiple sine waves for rolling hills
          const height = 
            Math.sin(x * 0.01) * 2 +
            Math.sin(z * 0.015) * 1.5 +
            Math.sin(x * 0.008 + z * 0.012) * 1 +
            Math.sin(x * 0.02) * 0.5;
          
          positions.setY(i, height);
        }
        
        positions.needsUpdate = true;
        geometry.computeVertexNormals();

        return (
          <mesh 
            key={chunk.id}
            position={[chunk.worldX, -1.5, chunk.worldZ]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            receiveShadow
          >
            <primitive object={geometry} />
            <meshLambertMaterial 
              map={terrainTexture}
              color="#4ADE80"
            />
          </mesh>
        );
      })}
    </group>
  );
};

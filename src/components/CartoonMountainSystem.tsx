
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ChunkData } from './ChunkSystem';

interface CartoonMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const CartoonMountainSystem: React.FC<CartoonMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Create gradient mountain texture
  const createMountainTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Vertical gradient from purple to pink
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8B5CF6'); // Purple top
    gradient.addColorStop(0.6, '#D946EF'); // Magenta middle
    gradient.addColorStop(1, '#F97316'); // Orange bottom
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
  };

  const mountainTexture = useMemo(() => createMountainTexture(), []);

  // Generate mountain positions
  const mountainPositions = useMemo(() => {
    const positions = [];
    
    chunks.forEach(chunk => {
      // Place mountains in the background
      if (chunk.worldZ < -50) {
        positions.push({
          id: `mountain_${chunk.id}`,
          x: chunk.worldX + (Math.random() - 0.5) * chunkSize,
          z: chunk.worldZ - 20 - Math.random() * 30,
          height: 15 + Math.random() * 25,
          width: 8 + Math.random() * 12
        });
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainPositions.map(mountain => (
        <mesh
          key={mountain.id}
          position={[mountain.x, mountain.height / 2, mountain.z]}
        >
          <coneGeometry args={[mountain.width, mountain.height, 8]} />
          <meshLambertMaterial 
            map={mountainTexture}
            color="#9333EA"
          />
        </mesh>
      ))}
    </group>
  );
};

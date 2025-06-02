
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ChunkData } from './ChunkSystem';

interface CartoonMagicalPathwayProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const CartoonMagicalPathway: React.FC<CartoonMagicalPathwayProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Create colorful stone path texture
  const createPathTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Base purple-pink gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#DDA0DD'); // Plum
    gradient.addColorStop(0.5, '#DA70D6'); // Orchid
    gradient.addColorStop(1, '#FF69B4'); // Hot pink
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add stone pattern
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    
    // Draw stone tiles
    for (let x = 0; x < canvas.width; x += 32) {
      for (let y = 0; y < canvas.height; y += 32) {
        ctx.strokeRect(x, y, 32, 32);
        
        // Add inner glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + 4, y + 4, 24, 24);
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  };

  const pathTexture = useMemo(() => createPathTexture(), []);

  // Generate path segments
  const pathSegments = useMemo(() => {
    const segments = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Create a winding path through each chunk
      const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(chunk.worldX - chunkSize/2, 0.1, chunk.worldZ - chunkSize/2),
        new THREE.Vector3(chunk.worldX - chunkSize/4, 0.1, chunk.worldZ),
        new THREE.Vector3(chunk.worldX + chunkSize/4, 0.1, chunk.worldZ),
        new THREE.Vector3(chunk.worldX + chunkSize/2, 0.1, chunk.worldZ + chunkSize/2)
      ]);
      
      const tubeGeometry = new THREE.TubeGeometry(pathCurve, 20, 2, 8, false);
      
      segments.push({
        id: `path_${chunk.id}`,
        geometry: tubeGeometry,
        position: [0, 0, 0] as [number, number, number]
      });
    }
    
    return segments;
  }, [chunks, chunkSize]);

  return (
    <group>
      {pathSegments.map(segment => (
        <mesh
          key={segment.id}
          position={segment.position}
          receiveShadow
          castShadow
        >
          <primitive object={segment.geometry} />
          <meshLambertMaterial 
            map={pathTexture}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* Add magical sparkles along the path */}
      {chunks.map(chunk => (
        <group key={`sparkles_${chunk.id}`}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh
              key={i}
              position={[
                chunk.worldX + (Math.random() - 0.5) * chunkSize * 0.8,
                0.5 + Math.sin(Date.now() * 0.001 + i) * 0.2,
                chunk.worldZ + (Math.random() - 0.5) * chunkSize * 0.8
              ]}
            >
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? '#FFD700' : '#FF69B4'}
                emissive={i % 2 === 0 ? '#FFD700' : '#FF69B4'}
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

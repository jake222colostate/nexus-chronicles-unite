
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PixelTerrainSystemProps {
  tier: number;
  opacity?: number;
}

export const PixelTerrainSystem: React.FC<PixelTerrainSystemProps> = ({ 
  tier, 
  opacity = 1 
}) => {
  // Create pixel-style textures
  const createPixelTexture = useMemo(() => {
    return (color: string, size: number = 64) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // Create pixelated pattern
      const pixelSize = 4;
      for (let x = 0; x < size; x += pixelSize) {
        for (let y = 0; y < size; y += pixelSize) {
          const brightness = 0.8 + Math.random() * 0.4;
          const pixelColor = `hsl(${color}, 60%, ${brightness * 50}%)`;
          ctx.fillStyle = pixelColor;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };
  }, []);

  const grassTexture = useMemo(() => createPixelTexture('120'), [createPixelTexture]);
  const pathTexture = useMemo(() => createPixelTexture('30'), [createPixelTexture]);
  const rockTexture = useMemo(() => createPixelTexture('0'), [createPixelTexture]);

  return (
    <group>
      {/* Main grass terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -50]} receiveShadow>
        <planeGeometry args={[60, 120]} />
        <meshLambertMaterial 
          map={grassTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Pixel-style dirt path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, -50]} receiveShadow>
        <planeGeometry args={[3, 120]} />
        <meshLambertMaterial 
          map={pathTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Left mountain range */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -10 - (i * 12);
        const height = 15 + Math.sin(i * 0.5) * 5;
        const width = 8 + Math.cos(i * 0.3) * 3;
        
        return (
          <group key={`left-mountain-${i}`}>
            {/* Main mountain */}
            <mesh position={[-25, height / 2, z]} castShadow>
              <boxGeometry args={[width, height, width]} />
              <meshLambertMaterial 
                map={rockTexture}
                transparent 
                opacity={opacity}
              />
            </mesh>
            
            {/* Mountain peak */}
            <mesh position={[-25, height + 3, z]} castShadow>
              <coneGeometry args={[width * 0.7, 6, 8]} />
              <meshLambertMaterial 
                color="#E5E7EB"
                transparent 
                opacity={opacity}
              />
            </mesh>
          </group>
        );
      })}

      {/* Right mountain range */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -15 - (i * 12);
        const height = 12 + Math.cos(i * 0.7) * 4;
        const width = 7 + Math.sin(i * 0.4) * 2;
        
        return (
          <group key={`right-mountain-${i}`}>
            {/* Main mountain */}
            <mesh position={[25, height / 2, z]} castShadow>
              <boxGeometry args={[width, height, width]} />
              <meshLambertMaterial 
                map={rockTexture}
                transparent 
                opacity={opacity}
              />
            </mesh>
            
            {/* Mountain peak */}
            <mesh position={[25, height + 2, z]} castShadow>
              <coneGeometry args={[width * 0.6, 4, 8]} />
              <meshLambertMaterial 
                color="#D1D5DB"
                transparent 
                opacity={opacity}
              />
            </mesh>
          </group>
        );
      })}

      {/* Organized trees along the path sides */}
      {Array.from({ length: 20 }, (_, i) => {
        const z = -10 - (i * 4);
        const side = i % 2 === 0 ? -1 : 1; // Alternate sides
        const x = side * (6 + Math.random() * 3); // 6-9 units from center
        
        return (
          <group key={`tree-${i}`} position={[x, -1, z]}>
            {/* Tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.3, 3]} />
              <meshLambertMaterial color="#8B4513" transparent opacity={opacity} />
            </mesh>
            
            {/* Tree foliage - more compact and consistent */}
            <mesh position={[0, 3, 0]} castShadow>
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshLambertMaterial color="#228B22" transparent opacity={opacity} />
            </mesh>
          </group>
        );
      })}

      {/* Scattered crystals for magical atmosphere */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 12 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = -30 - (i * 8) + Math.sin(angle) * 5;
        
        return (
          <mesh key={`crystal-${i}`} position={[x, 0.5, z]} castShadow>
            <octahedronGeometry args={[1]} />
            <meshBasicMaterial 
              color={tier >= 3 ? '#8B5CF6' : '#06B6D4'}
              transparent 
              opacity={opacity * 0.8}
            />
          </mesh>
        );
      })}

      {/* Rock formations near mountains */}
      {Array.from({ length: 6 }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (15 + Math.random() * 5);
        const z = -20 - (i * 10);
        
        return (
          <mesh key={`rock-${i}`} position={[x, 0, z]} castShadow>
            <boxGeometry args={[2, 1 + Math.random(), 2]} />
            <meshLambertMaterial 
              color="#696969"
              transparent 
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
};

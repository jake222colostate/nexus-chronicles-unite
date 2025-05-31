
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
  // Create pixel-style textures with tier variations
  const createPixelTexture = useMemo(() => {
    return (color: string, size: number = 64, tierVariation: boolean = false) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // Create pixelated pattern with tier-based variations
      const pixelSize = 4;
      for (let x = 0; x < size; x += pixelSize) {
        for (let y = 0; y < size; y += pixelSize) {
          let brightness = 0.8 + Math.random() * 0.4;
          let hue = color;
          
          // Tier-based color variations
          if (tierVariation) {
            switch (tier) {
              case 2:
                hue = '140'; // Brighter green
                brightness *= 1.1;
                break;
              case 3:
                hue = '160'; // Blue-green
                brightness *= 0.9;
                break;
              case 4:
                hue = '180'; // Darker blue-green
                brightness *= 0.8;
                break;
              case 5:
                hue = '200'; // Deep blue
                brightness *= 0.7;
                break;
            }
          }
          
          const pixelColor = `hsl(${hue}, 60%, ${brightness * 50}%)`;
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
  }, [tier]);

  const grassTexture = useMemo(() => createPixelTexture('120', 64, true), [createPixelTexture]);
  const pathTexture = useMemo(() => createPixelTexture('30'), [createPixelTexture]);
  const rockTexture = useMemo(() => createPixelTexture('0'), [createPixelTexture]);

  // Generate tier-based tree positions and colors
  const treePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 18; i++) {
      // Use a simple seeded random function to ensure consistent positioning
      const seed = i * 12345;
      const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
      const random2 = (((seed + 1) * 9301 + 49297) % 233280) / 233280;
      const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280;
      
      // Spread trees across the terrain with better distribution
      const x = (random1 - 0.5) * 45; // Spread across terrain width
      const z = -8 - (random2 * 100); // Spread along the path length
      const scale = 0.7 + random3 * 0.4; // Vary tree sizes
      
      // Ensure trees aren't too close to the path center
      const adjustedX = Math.abs(x) < 5 ? (x > 0 ? 8 : -8) : x;
      
      positions.push({ x: adjustedX, z, scale });
    }
    return positions;
  }, []);

  // Tier-based tree colors
  const getTreeColors = () => {
    switch (tier) {
      case 1:
        return { trunk: '#8B4513', foliage: '#228B22' };
      case 2:
        return { trunk: '#A0522D', foliage: '#32CD32' };
      case 3:
        return { trunk: '#654321', foliage: '#006400' };
      case 4:
        return { trunk: '#2F1B14', foliage: '#2F4F2F' };
      case 5:
        return { trunk: '#1C1C1C', foliage: '#191970' };
      default:
        return { trunk: '#8B4513', foliage: '#228B22' };
    }
  };

  const treeColors = getTreeColors();

  return (
    <group>
      {/* Main grass terrain - properly grounded */}
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

      {/* Left mountain range with tier-based variations */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -10 - (i * 12);
        const baseHeight = 15 + Math.sin(i * 0.5) * 5;
        const height = tier >= 3 ? baseHeight * 1.2 : baseHeight;
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
            
            {/* Mountain peak with tier-based colors */}
            <mesh position={[-25, height + 3, z]} castShadow>
              <coneGeometry args={[width * 0.7, 6, 8]} />
              <meshLambertMaterial 
                color={tier >= 4 ? '#B0C4DE' : tier >= 3 ? '#D3D3D3' : '#E5E7EB'}
                transparent 
                opacity={opacity}
              />
            </mesh>
          </group>
        );
      })}

      {/* Right mountain range with tier-based variations */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -15 - (i * 12);
        const baseHeight = 12 + Math.cos(i * 0.7) * 4;
        const height = tier >= 3 ? baseHeight * 1.15 : baseHeight;
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
            
            {/* Mountain peak with tier-based colors */}
            <mesh position={[25, height + 2, z]} castShadow>
              <coneGeometry args={[width * 0.6, 4, 8]} />
              <meshLambertMaterial 
                color={tier >= 4 ? '#A9A9A9' : tier >= 3 ? '#C0C0C0' : '#D1D5DB'}
                transparent 
                opacity={opacity}
              />
            </mesh>
          </group>
        );
      })}

      {/* Tier-based trees with color variations - properly grounded */}
      {treePositions.map((pos, i) => (
        <group key={`tree-${i}`} position={[pos.x, -1, pos.z]} scale={[pos.scale, pos.scale, pos.scale]}>
          {/* Tree trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 3]} />
            <meshLambertMaterial color={treeColors.trunk} transparent opacity={opacity} />
          </mesh>
          
          {/* Tree foliage with tier-based colors */}
          <mesh position={[0, 3, 0]} castShadow>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshLambertMaterial color={treeColors.foliage} transparent opacity={opacity} />
          </mesh>
        </group>
      ))}

      {/* Rock formations near mountains - properly grounded */}
      {Array.from({ length: 6 }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (15 + Math.random() * 5);
        const z = -20 - (i * 10);
        
        return (
          <mesh key={`rock-${i}`} position={[x, -0.5, z]} castShadow>
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

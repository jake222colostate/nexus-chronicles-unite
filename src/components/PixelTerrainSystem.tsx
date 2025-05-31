
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
  // Create natural-looking textures
  const createNaturalTexture = useMemo(() => {
    return (baseColor: string, variations: string[], size: number = 128) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // Create organic, natural pattern
      const pixelSize = 3;
      for (let x = 0; x < size; x += pixelSize) {
        for (let y = 0; y < size; y += pixelSize) {
          const randomVariation = variations[Math.floor(Math.random() * variations.length)];
          const brightness = 0.7 + Math.random() * 0.5;
          ctx.fillStyle = `hsl(${randomVariation}, 45%, ${brightness * 35}%)`;
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

  const grassTexture = useMemo(() => createNaturalTexture('120', ['115', '120', '125', '110']), [createNaturalTexture]);
  const pathTexture = useMemo(() => createNaturalTexture('30', ['25', '30', '35', '40']), [createNaturalTexture]);
  const mountainTexture = useMemo(() => createNaturalTexture('210', ['200', '210', '220', '215']), [createNaturalTexture]);

  // Generate natural, organic mountain positions with varied shapes and heights
  const mountainFormations = useMemo(() => {
    const formations = [];
    
    // Left mountain range - organic, staggered heights
    for (let i = 0; i < 25; i++) {
      const baseZ = -20 - (i * 35);
      const variance = (Math.random() - 0.5) * 20;
      
      // Primary mountain
      const height = 18 + Math.sin(i * 0.3) * 8 + Math.random() * 6;
      const width = 12 + Math.cos(i * 0.4) * 4 + Math.random() * 3;
      const depth = 10 + Math.random() * 4;
      
      formations.push({
        position: [-45 + Math.random() * 10, height / 2, baseZ + variance],
        scale: [width, height, depth],
        type: 'primary',
        side: 'left'
      });
      
      // Secondary smaller peaks
      if (Math.random() > 0.4) {
        formations.push({
          position: [-38 + Math.random() * 8, (height * 0.6) / 2, baseZ + variance + 15],
          scale: [width * 0.7, height * 0.6, depth * 0.8],
          type: 'secondary',
          side: 'left'
        });
      }
      
      // Background layer (further mountains)
      if (Math.random() > 0.6) {
        formations.push({
          position: [-65 + Math.random() * 15, (height * 0.8) / 2, baseZ + variance - 20],
          scale: [width * 1.2, height * 0.8, depth * 1.5],
          type: 'background',
          side: 'left'
        });
      }
    }
    
    // Right mountain range - organic, staggered heights
    for (let i = 0; i < 25; i++) {
      const baseZ = -25 - (i * 35);
      const variance = (Math.random() - 0.5) * 20;
      
      // Primary mountain
      const height = 16 + Math.cos(i * 0.4) * 7 + Math.random() * 5;
      const width = 11 + Math.sin(i * 0.3) * 3 + Math.random() * 3;
      const depth = 9 + Math.random() * 4;
      
      formations.push({
        position: [45 + Math.random() * 10, height / 2, baseZ + variance],
        scale: [width, height, depth],
        type: 'primary',
        side: 'right'
      });
      
      // Secondary smaller peaks
      if (Math.random() > 0.5) {
        formations.push({
          position: [38 + Math.random() * 8, (height * 0.7) / 2, baseZ + variance + 12],
          scale: [width * 0.6, height * 0.7, depth * 0.7],
          type: 'secondary',
          side: 'right'
        });
      }
      
      // Background layer
      if (Math.random() > 0.7) {
        formations.push({
          position: [65 + Math.random() * 15, (height * 0.9) / 2, baseZ + variance - 25],
          scale: [width * 1.3, height * 0.9, depth * 1.6],
          type: 'background',
          side: 'right'
        });
      }
    }
    
    return formations;
  }, []);

  // Generate natural forest with realistic clustering
  const forestPositions = useMemo(() => {
    const positions = [];
    const minDistance = 8;
    const maxAttempts = 150;
    
    // Create multiple forest clusters on both sides
    for (let cluster = 0; cluster < 12; cluster++) {
      const clusterSide = cluster % 2 === 0 ? -1 : 1;
      const clusterCenterZ = -15 - (cluster * 25) + (Math.random() - 0.5) * 30;
      const clusterCenterX = clusterSide * (18 + Math.random() * 15);
      
      // Trees per cluster varies naturally
      const treesInCluster = 4 + Math.floor(Math.random() * 5);
      
      for (let t = 0; t < treesInCluster; t++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale, type;
        
        while (!validPosition && attempts < maxAttempts) {
          const offsetX = (Math.random() - 0.5) * 35;
          const offsetZ = (Math.random() - 0.5) * 40;
          
          x = clusterCenterX + offsetX;
          z = clusterCenterZ + offsetZ;
          
          // Ensure trees stay away from path
          if (clusterSide > 0) {
            x = Math.max(12, x);
          } else {
            x = Math.min(-12, x);
          }
          
          scale = 0.7 + Math.random() * 0.9;
          type = Math.random() > 0.7 ? 'pine' : 'oak';
          
          // Check distance from existing trees
          validPosition = true;
          for (const existing of positions) {
            const distance = Math.sqrt(
              Math.pow(x - existing.x, 2) + Math.pow(z - existing.z, 2)
            );
            if (distance < minDistance) {
              validPosition = false;
              break;
            }
          }
          
          attempts++;
        }
        
        if (validPosition) {
          positions.push({ x, z, scale, type });
        }
      }
    }
    
    // Add scattered individual trees for natural randomness
    for (let i = 0; i < 20; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, scale, type;
      
      while (!validPosition && attempts < maxAttempts) {
        const side = Math.random() > 0.5 ? 1 : -1;
        x = side * (15 + Math.random() * 25);
        z = -10 - Math.random() * 200;
        scale = 0.6 + Math.random() * 0.8;
        type = Math.random() > 0.6 ? 'pine' : 'oak';
        
        validPosition = true;
        for (const existing of positions) {
          const distance = Math.sqrt(
            Math.pow(x - existing.x, 2) + Math.pow(z - existing.z, 2)
          );
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      }
      
      if (validPosition) {
        positions.push({ x, z, scale, type });
      }
    }
    
    return positions;
  }, []);

  return (
    <group>
      {/* Extended main grass terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -400]} receiveShadow>
        <planeGeometry args={[120, 850]} />
        <meshLambertMaterial 
          map={grassTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Extended stone path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, -400]} receiveShadow>
        <planeGeometry args={[4, 850]} />
        <meshLambertMaterial 
          map={pathTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Natural, organic mountain formations with realistic colors */}
      {mountainFormations.map((mountain, i) => {
        const colorIntensity = mountain.type === 'background' ? 0.4 : 
                             mountain.type === 'secondary' ? 0.6 : 0.8;
        
        return (
          <group key={`mountain-${i}`}>
            {/* Main mountain body - natural slate/gray colors */}
            <mesh 
              position={mountain.position} 
              scale={mountain.scale}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshLambertMaterial 
                map={mountainTexture}
                color={mountain.type === 'background' ? '#A8A9B0' : 
                       mountain.type === 'secondary' ? '#9495A0' : '#7B7C85'}
                transparent 
                opacity={opacity * colorIntensity}
              />
            </mesh>
            
            {/* Mountain peak with snow cap for primary mountains */}
            {mountain.type === 'primary' && (
              <mesh 
                position={[mountain.position[0], mountain.position[1] + mountain.scale[1] * 0.7, mountain.position[2]]}
                scale={[mountain.scale[0] * 0.7, mountain.scale[1] * 0.4, mountain.scale[2] * 0.7]}
                castShadow
              >
                <coneGeometry args={[0.5, 1, 8]} />
                <meshLambertMaterial 
                  color="#F8F9FA"
                  transparent 
                  opacity={opacity * colorIntensity}
                />
              </mesh>
            )}
            
            {/* Subtle mountain ridges for depth */}
            {mountain.type !== 'background' && Math.random() > 0.6 && (
              <mesh 
                position={[mountain.position[0] + (Math.random() - 0.5) * 3, mountain.position[1] * 0.8, mountain.position[2]]}
                scale={[mountain.scale[0] * 0.3, mountain.scale[1] * 0.8, mountain.scale[2] * 0.4]}
                castShadow
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshLambertMaterial 
                  color="#6B6C75"
                  transparent 
                  opacity={opacity * colorIntensity * 0.8}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Natural forest with diverse tree types */}
      {forestPositions.map((pos, i) => (
        <group key={`tree-${i}`} position={[pos.x, -1, pos.z]} scale={[pos.scale, pos.scale, pos.scale]}>
          {/* Tree trunk - varied colors */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 3.6]} />
            <meshLambertMaterial 
              color={pos.type === 'pine' ? "#6B4423" : "#8B4513"} 
              transparent 
              opacity={opacity} 
            />
          </mesh>
          
          {/* Tree foliage - different shapes for variety */}
          {pos.type === 'pine' ? (
            // Pine tree - conical shape
            <mesh position={[0, 3.5, 0]} castShadow>
              <coneGeometry args={[1.8, 4, 8]} />
              <meshLambertMaterial color="#1B5E20" transparent opacity={opacity} />
            </mesh>
          ) : (
            // Oak tree - spherical shape
            <mesh position={[0, 3.2, 0]} castShadow>
              <sphereGeometry args={[1.6, 12, 8]} />
              <meshLambertMaterial color="#2E7D32" transparent opacity={opacity} />
            </mesh>
          )}
          
          {/* Additional foliage layer for oak trees */}
          {pos.type === 'oak' && (
            <mesh position={[0, 4.5, 0]} castShadow>
              <sphereGeometry args={[1.0, 12, 8]} />
              <meshLambertMaterial color="#388E3C" transparent opacity={opacity * 0.8} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

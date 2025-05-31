
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface FantasyTerrainSystemProps {
  tier: number;
  opacity?: number;
  playerPosition?: [number, number, number];
}

export const FantasyTerrainSystem: React.FC<FantasyTerrainSystemProps> = ({ 
  tier, 
  opacity = 1,
  playerPosition = [0, 0, 0]
}) => {
  // Create fantasy ground textures
  const createFantasyTexture = useMemo(() => {
    return (type: 'grass' | 'stone_path', size: number = 128) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      if (type === 'grass') {
        // Rich grass texture
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, '#4ADE80');
        gradient.addColorStop(0.5, '#22C55E');
        gradient.addColorStop(1, '#16A34A');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Add grass blade details
        ctx.fillStyle = '#15803D';
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          ctx.fillRect(x, y, 2, 4);
        }
      } else if (type === 'stone_path') {
        // Fantasy stone tiles path
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, size, size);
        
        // Create stone tile pattern
        const tileSize = 16;
        for (let x = 0; x < size; x += tileSize) {
          for (let y = 0; y < size; y += tileSize) {
            if (Math.random() > 0.2) {
              const stoneColor = tier <= 2 ? '#A0916C' : tier <= 3 ? '#8A7CB8' : '#5D5566';
              ctx.fillStyle = stoneColor;
              ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
              
              // Add magical glow for higher tiers
              if (tier >= 3) {
                ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
              }
            }
          }
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };
  }, [tier]);

  const grassTexture = useMemo(() => createFantasyTexture('grass'), [createFantasyTexture]);
  const pathTexture = useMemo(() => createFantasyTexture('stone_path'), [createFantasyTexture]);

  // Create canyon-style mountain walls
  const createCanyonMountain = useMemo(() => {
    return (side: 'left' | 'right') => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      const uvs = [];
      
      const sideMultiplier = side === 'left' ? -1 : 1;
      const segments = 25;
      const baseDistance = 20; // Distance from center path
      
      let vertexIndex = 0;
      
      // Create mountain wall along the path
      for (let i = 0; i <= segments; i++) {
        const z = -5 - (i * 6); // Position along path
        const heightVariation = 12 + Math.sin(i * 0.4) * 6 + Math.cos(i * 0.8) * 3;
        const widthVariation = 4 + Math.sin(i * 0.6) * 2;
        
        // Base vertices (ground level)
        const baseX = sideMultiplier * baseDistance;
        const outerX = sideMultiplier * (baseDistance + widthVariation);
        
        vertices.push(baseX, -1, z); // Inner base
        vertices.push(outerX, -1, z); // Outer base
        vertices.push(outerX, heightVariation, z); // Peak
        
        uvs.push(0, 0, 1, 0, 1, 1);
        
        // Create triangles for this segment
        if (i < segments) {
          const base = vertexIndex;
          
          // Current triangle
          indices.push(base, base + 1, base + 2);
          
          // Connect to next segment
          indices.push(base, base + 2, base + 3);
          indices.push(base + 1, base + 4, base + 5);
          indices.push(base + 2, base + 5, base + 4);
        }
        
        vertexIndex += 3;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      
      return geometry;
    };
  }, []);

  // Mountain colors based on tier
  const getMountainColor = () => {
    switch (tier) {
      case 1: return '#6B7280'; // Gray stone
      case 2: return '#8B5A3C'; // Brown stone
      case 3: return '#7C3AED'; // Purple magical
      case 4: return '#1E1B4B'; // Dark mystical
      default: return '#0F0F23'; // Deep shadow
    }
  };

  // Trees positioned safely away from path
  const treePositions = useMemo(() => {
    const positions = [];
    const minDistanceFromPath = 10;
    
    for (let cluster = 0; cluster < 12; cluster++) {
      const side = cluster % 2 === 0 ? -1 : 1;
      const clusterZ = -8 - (cluster * 8);
      
      for (let t = 0; t < 2; t++) {
        const x = side * (minDistanceFromPath + Math.random() * 6);
        const z = clusterZ + (Math.random() - 0.5) * 4;
        const scale = 0.7 + Math.random() * 0.4;
        
        positions.push({ x, z, scale });
      }
    }
    
    return positions;
  }, []);

  return (
    <group>
      {/* Main grass terrain - wider for canyon effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -60]} receiveShadow>
        <planeGeometry args={[50, 160]} />
        <meshLambertMaterial 
          map={grassTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Fantasy stone path - centered and level */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, -60]} receiveShadow>
        <planeGeometry args={[4, 160]} />
        <meshLambertMaterial 
          map={pathTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Canyon mountain walls - left side */}
      <group position={[0, 0, -60]}>
        <mesh 
          geometry={createCanyonMountain('left')} 
          castShadow 
          receiveShadow
        >
          <meshLambertMaterial 
            color={getMountainColor()}
            transparent 
            opacity={opacity}
          />
        </mesh>
      </group>
      
      {/* Canyon mountain walls - right side */}
      <group position={[0, 0, -60]}>
        <mesh 
          geometry={createCanyonMountain('right')} 
          castShadow 
          receiveShadow
        >
          <meshLambertMaterial 
            color={getMountainColor()}
            transparent 
            opacity={opacity}
          />
        </mesh>
      </group>

      {/* Background mountain layers for depth */}
      <group position={[0, 0, -90]}>
        <mesh 
          geometry={createCanyonMountain('left')} 
          scale={[1.5, 0.8, 1]}
          castShadow 
          receiveShadow
        >
          <meshLambertMaterial 
            color={getMountainColor()}
            transparent 
            opacity={opacity * 0.4}
          />
        </mesh>
      </group>
      
      <group position={[0, 0, -90]}>
        <mesh 
          geometry={createCanyonMountain('right')} 
          scale={[1.5, 0.8, 1]}
          castShadow 
          receiveShadow
        >
          <meshLambertMaterial 
            color={getMountainColor()}
            transparent 
            opacity={opacity * 0.4}
          />
        </mesh>
      </group>

      {/* Trees positioned safely on canyon sides */}
      {treePositions.map((pos, i) => (
        <group key={`tree-${i}`} position={[pos.x, -1, pos.z]} scale={[pos.scale, pos.scale, pos.scale]}>
          {/* Tree trunk */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4]} />
            <meshLambertMaterial color="#8B4513" transparent opacity={opacity} />
          </mesh>
          
          {/* Tree foliage - tier-based colors */}
          <mesh position={[0, 4, 0]} castShadow>
            <sphereGeometry args={[2, 12, 12]} />
            <meshLambertMaterial 
              color={tier <= 2 ? '#228B22' : tier <= 3 ? '#6B46C1' : '#4C1D95'} 
              transparent 
              opacity={opacity} 
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

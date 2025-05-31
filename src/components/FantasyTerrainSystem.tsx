
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
    return (type: 'grass' | 'path' | 'stone', size: number = 128) => {
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
      } else if (type === 'path') {
        // Ancient stone path
        const baseColor = tier <= 2 ? '#8B7355' : tier <= 3 ? '#6B5B95' : '#4A4458';
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);
        
        // Stone pattern
        ctx.fillStyle = tier <= 2 ? '#A0916C' : tier <= 3 ? '#8A7CB8' : '#5D5566';
        for (let x = 0; x < size; x += 16) {
          for (let y = 0; y < size; y += 16) {
            if (Math.random() > 0.3) {
              ctx.fillRect(x + 1, y + 1, 14, 14);
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
  const pathTexture = useMemo(() => createFantasyTexture('path'), [createFantasyTexture]);

  // Create seamless mountain walls
  const createMountainWall = useMemo(() => {
    return (side: 'left' | 'right') => {
      const geometry = new THREE.PlaneGeometry(100, 40, 32, 16);
      const positions = geometry.attributes.position;
      
      // Create natural mountain profile
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        // Add height variation based on x position
        const heightVariation = Math.sin(x * 0.1) * 8 + Math.cos(x * 0.05) * 4;
        const depthVariation = Math.sin(x * 0.08) * 3;
        
        positions.setY(i, y + heightVariation);
        positions.setZ(i, z + depthVariation);
      }
      
      geometry.computeVertexNormals();
      return geometry;
    };
  }, []);

  // Mountain colors based on tier
  const getMountainColor = () => {
    switch (tier) {
      case 1: return '#6B7280';
      case 2: return '#8B5A3C';
      case 3: return '#7C3AED';
      case 4: return '#1E1B4B';
      default: return '#0F0F23';
    }
  };

  // Trees positioned safely away from path
  const treePositions = useMemo(() => {
    const positions = [];
    const minDistanceFromPath = 12;
    
    for (let cluster = 0; cluster < 15; cluster++) {
      const side = cluster % 2 === 0 ? -1 : 1;
      const clusterZ = -15 - (cluster * 10);
      
      for (let t = 0; t < 2; t++) {
        const x = side * (minDistanceFromPath + Math.random() * 8);
        const z = clusterZ + (Math.random() - 0.5) * 6;
        const scale = 0.8 + Math.random() * 0.4;
        
        positions.push({ x, z, scale });
      }
    }
    
    return positions;
  }, []);

  return (
    <group>
      {/* Main grass terrain - expanded and seamless */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -80]} receiveShadow>
        <planeGeometry args={[80, 200]} />
        <meshLambertMaterial 
          map={grassTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Fantasy stone path - wider and more visible */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, -80]} receiveShadow>
        <planeGeometry args={[6, 200]} />
        <meshLambertMaterial 
          map={pathTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Seamless mountain walls on both sides */}
      <group position={[-25, 8, -80]}>
        <mesh 
          geometry={createMountainWall('left')} 
          rotation={[0, Math.PI / 6, 0]}
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
      
      <group position={[25, 8, -80]}>
        <mesh 
          geometry={createMountainWall('right')} 
          rotation={[0, -Math.PI / 6, 0]}
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
      <group position={[-40, 12, -120]} scale={[1.5, 1.2, 1]}>
        <mesh 
          geometry={createMountainWall('left')} 
          castShadow 
          receiveShadow
        >
          <meshLambertMaterial 
            color={getMountainColor()}
            transparent 
            opacity={opacity * 0.6}
          />
        </mesh>
      </group>
      
      <group position={[40, 12, -120]} scale={[1.5, 1.2, 1]}>
        <mesh 
          geometry={createMountainWall('right')} 
          castShadow 
          receiveShadow
        >
          <meshLambertMaterial 
            color={getMountainColor()}
            transparent 
            opacity={opacity * 0.6}
          />
        </mesh>
      </group>

      {/* Fantasy trees positioned safely */}
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


import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PixelTerrainSystemProps {
  tier: number;
  opacity?: number;
  playerPosition?: [number, number, number];
}

export const PixelTerrainSystem: React.FC<PixelTerrainSystemProps> = ({ 
  tier, 
  opacity = 1,
  playerPosition = [0, 0, 0]
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

  // Create seamless mountain range with proper terrain generation
  const createSeamlessMountainRange = useMemo(() => {
    return (side: 'left' | 'right', segments: number = 20) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      const uvs = [];
      
      const sideMultiplier = side === 'left' ? -1 : 1;
      const baseDistance = 25; // Distance from center path
      
      // Generate mountain profile using noise-like function
      const mountainProfile = [];
      for (let i = 0; i <= segments; i++) {
        const z = -10 - (i * 8); // Extend along path
        const noiseValue = Math.sin(i * 0.3) * 0.5 + Math.cos(i * 0.7) * 0.3 + Math.sin(i * 0.1) * 0.2;
        const height = 15 + noiseValue * 8; // Base height with variation
        const width = 8 + Math.sin(i * 0.4) * 3; // Width variation
        mountainProfile.push({ z, height, width });
      }
      
      let vertexIndex = 0;
      
      // Create vertices for mountain range
      for (let i = 0; i < mountainProfile.length; i++) {
        const profile = mountainProfile[i];
        
        // Base vertices (ground level)
        const baseX = sideMultiplier * (baseDistance + profile.width);
        vertices.push(baseX, -1, profile.z); // Base outer
        vertices.push(sideMultiplier * baseDistance, -1, profile.z); // Base inner
        uvs.push(i / segments, 0, i / segments, 0);
        
        // Peak vertex
        const peakX = sideMultiplier * (baseDistance + profile.width * 0.6);
        vertices.push(peakX, profile.height, profile.z);
        uvs.push(i / segments, 1);
        
        // Create triangles for this segment
        if (i < mountainProfile.length - 1) {
          const baseIndex = vertexIndex;
          
          // Triangle 1: base to peak
          indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
          
          // Triangle 2: connect to next segment
          indices.push(baseIndex + 1, baseIndex + 4, baseIndex + 3);
          indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
          
          // Triangle 3: outer base connection
          indices.push(baseIndex, baseIndex + 2, baseIndex + 5);
          indices.push(baseIndex, baseIndex + 5, baseIndex + 3);
        }
        
        vertexIndex += 3;
      }
      
      // Set geometry attributes
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      
      return geometry;
    };
  }, []);

  // Generate mountain ranges with parallax effect
  const mountainRanges = useMemo(() => {
    const ranges = [];
    
    // Near mountain ranges (main)
    ranges.push({
      geometry: createSeamlessMountainRange('left'),
      position: [0, 0, playerPosition[2] * 0.1], // Slight parallax
      color: tier <= 2 ? '#6B7280' : tier <= 3 ? '#7C3AED' : '#1E1B4B',
      scale: 1
    });
    
    ranges.push({
      geometry: createSeamlessMountainRange('right'),
      position: [0, 0, playerPosition[2] * 0.1],
      color: tier <= 2 ? '#9CA3AF' : tier <= 3 ? '#8B5CF6' : '#312E81',
      scale: 1
    });
    
    // Far mountain ranges (background with more parallax)
    ranges.push({
      geometry: createSeamlessMountainRange('left', 15),
      position: [-20, -3, playerPosition[2] * 0.05], // More parallax
      color: tier <= 2 ? '#D1D5DB' : tier <= 3 ? '#A855F7' : '#4C1D95',
      scale: 1.8
    });
    
    ranges.push({
      geometry: createSeamlessMountainRange('right', 15),
      position: [20, -3, playerPosition[2] * 0.05],
      color: tier <= 2 ? '#E5E7EB' : tier <= 3 ? '#C084FC' : '#6366F1',
      scale: 1.8
    });
    
    return ranges;
  }, [createSeamlessMountainRange, tier, playerPosition]);

  // Generate trees positioned safely away from path
  const treePositions = useMemo(() => {
    const positions = [];
    const minDistanceFromPath = 8; // Ensure trees don't block upgrades
    
    // Generate trees in safe zones
    for (let cluster = 0; cluster < 12; cluster++) {
      const side = cluster % 2 === 0 ? -1 : 1;
      const clusterZ = -10 - (cluster * 12);
      
      for (let t = 0; t < 3; t++) {
        const x = side * (minDistanceFromPath + Math.random() * 15);
        const z = clusterZ + (Math.random() - 0.5) * 8;
        const scale = 0.6 + Math.random() * 0.6;
        
        positions.push({ x, z, scale });
      }
    }
    
    return positions;
  }, []);

  return (
    <group>
      {/* Main grass terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -50]} receiveShadow>
        <planeGeometry args={[60, 140]} />
        <meshLambertMaterial 
          map={grassTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Clear, visible path for upgrades */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, -50]} receiveShadow>
        <planeGeometry args={[4, 140]} />
        <meshLambertMaterial 
          map={pathTexture}
          transparent 
          opacity={opacity}
        />
      </mesh>

      {/* Seamless mountain ranges with parallax */}
      {mountainRanges.map((range, index) => (
        <group key={`mountain-range-${index}`} position={range.position} scale={[range.scale, range.scale, range.scale]}>
          <mesh geometry={range.geometry} castShadow receiveShadow>
            <meshLambertMaterial 
              color={range.color}
              transparent 
              opacity={opacity}
            />
          </mesh>
        </group>
      ))}

      {/* Trees positioned safely away from upgrade path */}
      {treePositions.map((pos, i) => (
        <group key={`tree-${i}`} position={[pos.x, -1, pos.z]} scale={[pos.scale, pos.scale, pos.scale]}>
          {/* Tree trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 3]} />
            <meshLambertMaterial color="#8B4513" transparent opacity={opacity} />
          </mesh>
          
          {/* Tree foliage */}
          <mesh position={[0, 3, 0]} castShadow>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshLambertMaterial color="#228B22" transparent opacity={opacity} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

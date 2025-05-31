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

  // Create polygon mountain geometries
  const createPolygonMountain = useMemo(() => {
    return (width: number, height: number, depth: number, complexity: number = 8) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const faces = [];
      
      // Base vertices (bottom)
      const baseRadius = Math.max(width, depth) * 0.5;
      for (let i = 0; i < complexity; i++) {
        const angle = (i / complexity) * Math.PI * 2;
        const x = Math.cos(angle) * baseRadius * (0.8 + Math.random() * 0.4);
        const z = Math.sin(angle) * baseRadius * (0.8 + Math.random() * 0.4);
        vertices.push(x, -height * 0.1, z);
      }
      
      // Middle ring vertices
      const midRadius = baseRadius * 0.6;
      const midHeight = height * 0.4;
      for (let i = 0; i < complexity; i++) {
        const angle = (i / complexity) * Math.PI * 2;
        const x = Math.cos(angle) * midRadius * (0.7 + Math.random() * 0.6);
        const z = Math.sin(angle) * midRadius * (0.7 + Math.random() * 0.6);
        vertices.push(x, midHeight, z);
      }
      
      // Peak vertices (multiple peaks for more natural look)
      const peakCount = 2 + Math.floor(Math.random() * 3);
      for (let p = 0; p < peakCount; p++) {
        const peakAngle = (p / peakCount) * Math.PI * 2 + Math.random() * 0.5;
        const peakRadius = baseRadius * (0.2 + Math.random() * 0.3);
        const x = Math.cos(peakAngle) * peakRadius;
        const z = Math.sin(peakAngle) * peakRadius;
        const y = height * (0.8 + Math.random() * 0.4);
        vertices.push(x, y, z);
      }
      
      // Create faces connecting base to middle
      for (let i = 0; i < complexity; i++) {
        const next = (i + 1) % complexity;
        faces.push(i, next, i + complexity);
        faces.push(next, next + complexity, i + complexity);
      }
      
      // Create faces connecting middle to peaks
      const peakStartIndex = complexity * 2;
      for (let i = 0; i < complexity; i++) {
        const next = (i + 1) % complexity;
        const midIndex = i + complexity;
        const nextMidIndex = next + complexity;
        
        // Connect to nearest peak
        const peakIndex = peakStartIndex + (i % peakCount);
        faces.push(midIndex, nextMidIndex, peakIndex);
      }
      
      // Create faces between peaks
      for (let p = 0; p < peakCount; p++) {
        const nextPeak = (p + 1) % peakCount;
        const peakIndex = peakStartIndex + p;
        const nextPeakIndex = peakStartIndex + nextPeak;
        
        // Connect peaks to middle ring
        const midIndex = complexity + (p * Math.floor(complexity / peakCount)) % complexity;
        faces.push(peakIndex, nextPeakIndex, midIndex);
      }
      
      // Convert to flat arrays
      const verticesArray = new Float32Array(vertices);
      const indicesArray = new Uint16Array(faces);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
      geometry.setIndex(new THREE.BufferAttribute(indicesArray, 1));
      geometry.computeVertexNormals();
      
      return geometry;
    };
  }, []);

  // Generate mountain data with varied polygon shapes
  const mountainData = useMemo(() => {
    const mountains = [];
    
    // Left mountain range - larger, more prominent
    for (let i = 0; i < 6; i++) {
      const z = -15 - (i * 18);
      const baseWidth = 12 + Math.sin(i * 0.7) * 4;
      const height = 18 + Math.cos(i * 0.5) * 6;
      const depth = 10 + Math.sin(i * 0.3) * 3;
      
      mountains.push({
        position: [-28, 0, z],
        geometry: createPolygonMountain(baseWidth, height, depth, 8 + i % 3),
        color: tier <= 2 ? '#6B7280' : tier <= 3 ? '#7C3AED' : '#1E1B4B',
        scale: 1 + (i * 0.1)
      });
    }
    
    // Right mountain range - smaller, more numerous
    for (let i = 0; i < 8; i++) {
      const z = -10 - (i * 14);
      const baseWidth = 8 + Math.cos(i * 0.6) * 3;
      const height = 12 + Math.sin(i * 0.8) * 4;
      const depth = 8 + Math.cos(i * 0.4) * 2;
      
      mountains.push({
        position: [25, 0, z],
        geometry: createPolygonMountain(baseWidth, height, depth, 6 + i % 2),
        color: tier <= 2 ? '#9CA3AF' : tier <= 3 ? '#8B5CF6' : '#312E81',
        scale: 0.8 + (i * 0.08)
      });
    }
    
    // Background distant mountains
    for (let i = 0; i < 4; i++) {
      const z = -120 - (i * 25);
      const baseWidth = 20 + Math.random() * 10;
      const height = 25 + Math.random() * 10;
      const depth = 15 + Math.random() * 5;
      const side = i % 2 === 0 ? -1 : 1;
      
      mountains.push({
        position: [side * (40 + Math.random() * 20), -5, z],
        geometry: createPolygonMountain(baseWidth, height, depth, 10),
        color: tier <= 2 ? '#D1D5DB' : tier <= 3 ? '#A855F7' : '#4C1D95',
        scale: 1.5 + Math.random() * 0.5
      });
    }
    
    return mountains;
  }, [createPolygonMountain, tier]);

  // Generate truly random tree positions for natural forest appearance
  const treePositions = useMemo(() => {
    const positions = [];
    const minDistance = 6; // Reduced minimum distance for denser forest
    const maxAttempts = 100;
    
    // Create clusters of trees on each side
    for (let cluster = 0; cluster < 8; cluster++) {
      const clusterSide = cluster % 2 === 0 ? -1 : 1; // Alternate sides
      const clusterCenterZ = -10 - (cluster * 15) + (Math.random() - 0.5) * 20;
      const clusterCenterX = clusterSide * (12 + Math.random() * 15);
      
      // Add 3-5 trees per cluster
      const treesInCluster = 3 + Math.floor(Math.random() * 3);
      
      for (let t = 0; t < treesInCluster; t++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, scale;
        
        while (!validPosition && attempts < maxAttempts) {
          // Random offset from cluster center
          const offsetX = (Math.random() - 0.5) * 25;
          const offsetZ = (Math.random() - 0.5) * 30;
          
          x = clusterCenterX + offsetX;
          z = clusterCenterZ + offsetZ;
          
          // Ensure trees stay on their side and away from path
          if (clusterSide > 0) {
            x = Math.max(6, x); // Right side, minimum 6 units from center
          } else {
            x = Math.min(-6, x); // Left side, minimum 6 units from center
          }
          
          // Random scale for variety
          scale = 0.6 + Math.random() * 0.8;
          
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
          positions.push({ x, z, scale });
        }
      }
    }
    
    // Add some scattered individual trees for extra randomness
    for (let i = 0; i < 12; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, z, scale;
      
      while (!validPosition && attempts < maxAttempts) {
        const side = Math.random() > 0.5 ? 1 : -1;
        x = side * (8 + Math.random() * 20); // 8-28 units from center
        z = -5 - Math.random() * 100; // Anywhere along the path
        scale = 0.5 + Math.random() * 0.7;
        
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
        positions.push({ x, z, scale });
      }
    }
    
    return positions;
  }, []);

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

      {/* Polygon-shaped mountain ranges */}
      {mountainData.map((mountain, index) => (
        <group key={`mountain-${index}`} position={mountain.position} scale={[mountain.scale, mountain.scale, mountain.scale]}>
          {/* Main mountain body */}
          <mesh geometry={mountain.geometry} castShadow receiveShadow>
            <meshLambertMaterial 
              color={mountain.color}
              transparent 
              opacity={opacity}
            />
          </mesh>
          
          {/* Snow cap for higher mountains */}
          {mountain.position[1] + mountain.scale * 15 > 10 && (
            <mesh 
              geometry={createPolygonMountain(
                mountain.scale * 3, 
                mountain.scale * 4, 
                mountain.scale * 3, 
                6
              )} 
              position={[0, mountain.scale * 12, 0]}
              castShadow
            >
              <meshLambertMaterial 
                color="#F9FAFB"
                transparent 
                opacity={opacity * 0.9}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Naturally scattered trees creating diverse forest clusters */}
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

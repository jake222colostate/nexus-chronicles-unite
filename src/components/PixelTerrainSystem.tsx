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

  // Create solid mountain geometries with proper face connections
  const createSolidMountain = useMemo(() => {
    return (width: number, height: number, depth: number, extendTowardsCenter: boolean = false) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      
      // Create vertex rings from bottom to top
      const rings = [
        { segments: 12, radius: 1.0, height: -0.3 },  // Base ring (largest)
        { segments: 10, radius: 0.7, height: 0.2 },   // Lower middle
        { segments: 8, radius: 0.5, height: 0.5 },    // Upper middle  
        { segments: 6, radius: 0.3, height: 0.8 },    // Near peak
        { segments: 1, radius: 0.0, height: 1.0 }     // Peak (single point)
      ];
      
      let vertexIndex = 0;
      const ringStartIndices = [];
      
      // Create vertices for each ring
      rings.forEach((ring, ringIndex) => {
        ringStartIndices.push(vertexIndex);
        
        if (ring.segments === 1) {
          // Peak vertex
          const peakVariation = (Math.random() - 0.5) * 0.2;
          vertices.push(
            peakVariation * width,
            height * ring.height,
            peakVariation * depth
          );
          vertexIndex++;
        } else {
          // Ring vertices
          for (let i = 0; i < ring.segments; i++) {
            const angle = (i / ring.segments) * Math.PI * 2;
            let radius = ring.radius;
            
            // Apply extension toward center if needed
            if (extendTowardsCenter && ringIndex === 0) {
              const centerAngle = 0;
              const angleDiff = Math.abs(angle - centerAngle);
              const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
              const extensionFactor = 1 + (1 - normalizedDiff / Math.PI) * 0.4;
              radius *= extensionFactor;
            }
            
            // Add natural variation
            radius *= (0.8 + Math.random() * 0.4);
            
            const x = Math.cos(angle) * radius * width;
            const z = Math.sin(angle) * radius * depth;
            const y = height * ring.height + (Math.random() - 0.5) * height * 0.1;
            
            vertices.push(x, y, z);
            vertexIndex++;
          }
        }
      });
      
      // Create faces between adjacent rings
      for (let ringIndex = 0; ringIndex < rings.length - 1; ringIndex++) {
        const currentRing = rings[ringIndex];
        const nextRing = rings[ringIndex + 1];
        const currentStart = ringStartIndices[ringIndex];
        const nextStart = ringStartIndices[ringIndex + 1];
        
        if (nextRing.segments === 1) {
          // Connect to peak
          const peakIndex = nextStart;
          for (let i = 0; i < currentRing.segments; i++) {
            const current = currentStart + i;
            const next = currentStart + ((i + 1) % currentRing.segments);
            
            // Triangle from current ring edge to peak
            indices.push(current, next, peakIndex);
          }
        } else {
          // Connect two rings with proper triangulation
          for (let i = 0; i < currentRing.segments; i++) {
            const currentVertex = currentStart + i;
            const nextCurrentVertex = currentStart + ((i + 1) % currentRing.segments);
            
            // Map to next ring vertices (handle different segment counts)
            const ratio = nextRing.segments / currentRing.segments;
            const nextVertex = nextStart + Math.floor(i * ratio) % nextRing.segments;
            const nextNextVertex = nextStart + Math.floor((i + 1) * ratio) % nextRing.segments;
            
            // Create quad using two triangles
            if (nextVertex !== nextNextVertex) {
              // Normal case: create quad
              indices.push(currentVertex, nextCurrentVertex, nextVertex);
              indices.push(nextCurrentVertex, nextNextVertex, nextVertex);
            } else {
              // Edge case: create single triangle
              indices.push(currentVertex, nextCurrentVertex, nextVertex);
            }
          }
        }
      }
      
      // Create base (bottom cap)
      const baseRingStart = ringStartIndices[0];
      const baseSegments = rings[0].segments;
      for (let i = 1; i < baseSegments - 1; i++) {
        indices.push(
          baseRingStart,
          baseRingStart + i,
          baseRingStart + i + 1
        );
      }
      
      // Convert to typed arrays
      const verticesArray = new Float32Array(vertices);
      const indicesArray = new Uint16Array(indices);
      
      // Set geometry attributes
      geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
      geometry.setIndex(new THREE.BufferAttribute(indicesArray, 1));
      geometry.computeVertexNormals();
      
      return geometry;
    };
  }, []);

  // Generate mountain data with better positioning
  const mountainData = useMemo(() => {
    const mountains = [];
    
    // Left mountain range
    for (let i = 0; i < 5; i++) {
      const z = -20 - (i * 22);
      const baseWidth = 12 + Math.sin(i * 0.7) * 4;
      const height = 18 + Math.cos(i * 0.5) * 6;
      const depth = 10 + Math.sin(i * 0.3) * 3;
      const extendToCenter = Math.random() > 0.5;
      
      mountains.push({
        position: [-30, 0, z],
        geometry: createSolidMountain(baseWidth, height, depth, extendToCenter),
        color: tier <= 2 ? '#6B7280' : tier <= 3 ? '#7C3AED' : '#1E1B4B',
        scale: 1 + (i * 0.05)
      });
    }
    
    // Right mountain range
    for (let i = 0; i < 6; i++) {
      const z = -15 - (i * 18);
      const baseWidth = 8 + Math.cos(i * 0.6) * 3;
      const height = 12 + Math.sin(i * 0.8) * 4;
      const depth = 7 + Math.cos(i * 0.4) * 2;
      const extendToCenter = Math.random() > 0.4;
      
      mountains.push({
        position: [26, 0, z],
        geometry: createSolidMountain(baseWidth, height, depth, extendToCenter),
        color: tier <= 2 ? '#9CA3AF' : tier <= 3 ? '#8B5CF6' : '#312E81',
        scale: 0.9 + (i * 0.06)
      });
    }
    
    // Background distant mountains
    for (let i = 0; i < 3; i++) {
      const z = -120 - (i * 25);
      const baseWidth = 20 + Math.random() * 10;
      const height = 25 + Math.random() * 10;
      const depth = 15 + Math.random() * 5;
      const side = i % 2 === 0 ? -1 : 1;
      
      mountains.push({
        position: [side * (40 + Math.random() * 10), -5, z],
        geometry: createSolidMountain(baseWidth, height, depth, false),
        color: tier <= 2 ? '#D1D5DB' : tier <= 3 ? '#A855F7' : '#4C1D95',
        scale: 1.5 + Math.random() * 0.3
      });
    }
    
    return mountains;
  }, [createSolidMountain, tier]);

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

      {/* Solid mountain ranges with proper geometry */}
      {mountainData.map((mountain, index) => (
        <group key={`mountain-${index}`} position={mountain.position} scale={[mountain.scale, mountain.scale, mountain.scale]}>
          <mesh geometry={mountain.geometry} castShadow receiveShadow>
            <meshLambertMaterial 
              color={mountain.color}
              transparent 
              opacity={opacity}
            />
          </mesh>
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

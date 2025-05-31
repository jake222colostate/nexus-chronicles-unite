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

  // Create natural mountain geometries with proper bases
  const createNaturalMountain = useMemo(() => {
    return (width: number, height: number, depth: number, extendTowardsCenter: boolean = false) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const faces = [];
      
      // Create a much larger base that extends naturally
      const baseComplexity = 12;
      const baseRadius = Math.max(width, depth) * 0.8;
      
      // Base vertices - create a larger, more natural base
      for (let i = 0; i < baseComplexity; i++) {
        const angle = (i / baseComplexity) * Math.PI * 2;
        let radius = baseRadius;
        
        // If extending towards center, make one side extend more
        if (extendTowardsCenter) {
          const centerAngle = 0; // Angle pointing toward trail center
          const angleDiff = Math.abs(angle - centerAngle);
          const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
          const extensionFactor = 1 + (1 - normalizedDiff / Math.PI) * 0.6; // Extend up to 60% more
          radius *= extensionFactor;
        }
        
        // Add natural variation
        radius *= (0.7 + Math.random() * 0.6);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        vertices.push(x, -height * 0.2, z); // Lower the base more
      }
      
      // Middle ring vertices - create natural stepped formation
      const midComplexity = 8;
      const midRadius = baseRadius * 0.5;
      const midHeight = height * 0.3;
      for (let i = 0; i < midComplexity; i++) {
        const angle = (i / midComplexity) * Math.PI * 2;
        const radius = midRadius * (0.6 + Math.random() * 0.8);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        vertices.push(x, midHeight + (Math.random() - 0.5) * height * 0.2, z);
      }
      
      // Upper ring vertices
      const upperComplexity = 6;
      const upperRadius = baseRadius * 0.25;
      const upperHeight = height * 0.7;
      for (let i = 0; i < upperComplexity; i++) {
        const angle = (i / upperComplexity) * Math.PI * 2;
        const radius = upperRadius * (0.4 + Math.random() * 1.2);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        vertices.push(x, upperHeight + (Math.random() - 0.5) * height * 0.15, z);
      }
      
      // Peak vertices - multiple peaks for natural look
      const peakCount = 1 + Math.floor(Math.random() * 2);
      for (let p = 0; p < peakCount; p++) {
        const peakAngle = (p / Math.max(peakCount, 1)) * Math.PI * 2 + Math.random() * 1;
        const peakRadius = baseRadius * (0.05 + Math.random() * 0.15);
        const x = Math.cos(peakAngle) * peakRadius;
        const z = Math.sin(peakAngle) * peakRadius;
        const y = height * (0.85 + Math.random() * 0.3);
        vertices.push(x, y, z);
      }
      
      // Connect base to middle ring
      for (let i = 0; i < baseComplexity; i++) {
        const next = (i + 1) % baseComplexity;
        const midIndex = baseComplexity + (i % midComplexity);
        const nextMidIndex = baseComplexity + ((i + 1) % midComplexity);
        
        faces.push(i, next, midIndex);
        faces.push(next, nextMidIndex, midIndex);
      }
      
      // Connect middle to upper ring
      for (let i = 0; i < midComplexity; i++) {
        const next = (i + 1) % midComplexity;
        const midIndex = baseComplexity + i;
        const nextMidIndex = baseComplexity + next;
        const upperIndex = baseComplexity + midComplexity + (i % upperComplexity);
        const nextUpperIndex = baseComplexity + midComplexity + ((i + 1) % upperComplexity);
        
        faces.push(midIndex, nextMidIndex, upperIndex);
        faces.push(nextMidIndex, nextUpperIndex, upperIndex);
      }
      
      // Connect upper ring to peaks
      const peakStartIndex = baseComplexity + midComplexity + upperComplexity;
      for (let i = 0; i < upperComplexity; i++) {
        const upperIndex = baseComplexity + midComplexity + i;
        const peakIndex = peakStartIndex + (i % peakCount);
        const nextUpperIndex = baseComplexity + midComplexity + ((i + 1) % upperComplexity);
        
        faces.push(upperIndex, nextUpperIndex, peakIndex);
      }
      
      // Connect peaks if multiple
      if (peakCount > 1) {
        for (let p = 0; p < peakCount; p++) {
          const nextPeak = (p + 1) % peakCount;
          const peakIndex = peakStartIndex + p;
          const nextPeakIndex = peakStartIndex + nextPeak;
          const upperIndex = baseComplexity + midComplexity + (p % upperComplexity);
          
          faces.push(peakIndex, nextPeakIndex, upperIndex);
        }
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

  // Generate mountain data with better positioning and natural extension
  const mountainData = useMemo(() => {
    const mountains = [];
    
    // Left mountain range - extend some towards center
    for (let i = 0; i < 5; i++) {
      const z = -20 - (i * 22);
      const baseWidth = 15 + Math.sin(i * 0.7) * 5;
      const height = 20 + Math.cos(i * 0.5) * 8;
      const depth = 12 + Math.sin(i * 0.3) * 4;
      const extendToCenter = Math.random() > 0.4; // 60% chance to extend
      
      mountains.push({
        position: [-32, 0, z],
        geometry: createNaturalMountain(baseWidth, height, depth, extendToCenter),
        color: tier <= 2 ? '#6B7280' : tier <= 3 ? '#7C3AED' : '#1E1B4B',
        scale: 1 + (i * 0.08)
      });
    }
    
    // Right mountain range - extend some towards center
    for (let i = 0; i < 6; i++) {
      const z = -15 - (i * 18);
      const baseWidth = 10 + Math.cos(i * 0.6) * 4;
      const height = 14 + Math.sin(i * 0.8) * 5;
      const depth = 9 + Math.cos(i * 0.4) * 3;
      const extendToCenter = Math.random() > 0.5; // 50% chance to extend
      
      mountains.push({
        position: [28, 0, z],
        geometry: createNaturalMountain(baseWidth, height, depth, extendToCenter),
        color: tier <= 2 ? '#9CA3AF' : tier <= 3 ? '#8B5CF6' : '#312E81',
        scale: 0.9 + (i * 0.07)
      });
    }
    
    // Background distant mountains - larger and more imposing
    for (let i = 0; i < 3; i++) {
      const z = -130 - (i * 30);
      const baseWidth = 25 + Math.random() * 15;
      const height = 30 + Math.random() * 15;
      const depth = 20 + Math.random() * 8;
      const side = i % 2 === 0 ? -1 : 1;
      
      mountains.push({
        position: [side * (45 + Math.random() * 15), -8, z],
        geometry: createNaturalMountain(baseWidth, height, depth, false),
        color: tier <= 2 ? '#D1D5DB' : tier <= 3 ? '#A855F7' : '#4C1D95',
        scale: 1.8 + Math.random() * 0.4
      });
    }
    
    return mountains;
  }, [createNaturalMountain, tier]);

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

      {/* Natural mountain ranges with extended bases */}
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
          
          {/* Snow cap for taller mountains */}
          {mountain.scale * 20 > 18 && (
            <mesh 
              geometry={createNaturalMountain(
                mountain.scale * 2, 
                mountain.scale * 3, 
                mountain.scale * 2, 
                false
              )} 
              position={[0, mountain.scale * 15, 0]}
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

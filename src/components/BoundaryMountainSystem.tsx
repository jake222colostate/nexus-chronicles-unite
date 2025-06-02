
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface BoundaryMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const OptimizedMountainCluster: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  scale: number;
  side: 'left' | 'right';
}> = ({ position, seed, scale, side }) => {
  
  // Create low-poly mountain geometry that matches the reference image
  const createLowPolyMountainGeometry = (mountainSeed: number) => {
    // Create a more complex base geometry for the mountain profile
    const geometry = new THREE.ConeGeometry(8, 25, 8, 1, false); // Wider base, taller height
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Modify vertices to create the distinctive mountain shape
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      // Height factor from bottom (0) to top (1)
      const heightFactor = (y + 12.5) / 25;
      
      // Create the distinctive profile - wider at base, narrower at top
      // But also push the top further back (negative Z direction)
      if (heightFactor > 0.3) {
        // Push upper portions back farther from the path
        const backwardsPush = heightFactor * heightFactor * 15; // Quadratic falloff
        vertices[i + 2] = z - backwardsPush;
        
        // Add some randomness for natural variation
        const noise = seededRandom(mountainSeed + x * 10 + y * 10 + z * 10) - 0.5;
        vertices[i] += noise * 2 * heightFactor;
        vertices[i + 2] += noise * 3 * heightFactor;
      }
      
      // Create terraced/stepped appearance for low-poly look
      const stepHeight = Math.floor(y / 3) * 3;
      const stepFactor = (stepHeight + 12.5) / 25;
      vertices[i + 1] = stepHeight;
      
      // Add angular faceted details
      const facetNoise = Math.floor(seededRandom(mountainSeed + i) * 4) - 2;
      vertices[i] += facetNoise * 0.5 * stepFactor;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  // Create layered mountain base that extends towards the path
  const createMountainBase = (baseSeed: number) => {
    const layers = [];
    
    // Multiple layers to create the wide base close to the path
    for (let layer = 0; layer < 4; layer++) {
      const layerHeight = 3 + layer * 2;
      const layerRadius = 12 - layer * 2; // Smaller as we go up
      const layerY = -1 + layer * 2;
      
      // Push base layers closer to the path
      const forwardPush = (4 - layer) * 3; // Closer layers pushed more towards path
      const layerZ = layer === 0 ? forwardPush : forwardPush * 0.7;
      
      layers.push(
        <mesh
          key={`base-layer-${layer}`}
          position={[0, layerY, layerZ]}
          receiveShadow
          castShadow
        >
          <cylinderGeometry args={[layerRadius * 0.8, layerRadius, layerHeight, 8]} />
          <meshLambertMaterial 
            color={layer === 0 ? "#4CAF50" : layer === 1 ? "#8D6E63" : layer === 2 ? "#A0522D" : "#8B7355"} 
          />
        </mesh>
      );
    }
    
    return layers;
  };

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Wide mountain base extending towards the path */}
      {createMountainBase(seed)}
      
      {/* Main mountain peaks - positioned further back */}
      {Array.from({ length: 2 + Math.floor(seededRandom(seed) * 2) }, (_, i) => {
        const peakSeed = seed + i * 47;
        const peakX = (seededRandom(peakSeed + 1) - 0.5) * 8;
        const peakY = 5 + seededRandom(peakSeed + 2) * 8;
        const peakZ = -5 - seededRandom(peakSeed + 3) * 12; // Position peaks further back
        const peakScale = 0.7 + seededRandom(peakSeed + 4) * 0.6;
        
        return (
          <mesh
            key={`peak-${i}`}
            position={[peakX, peakY, peakZ]}
            scale={[peakScale, peakScale, peakScale]}
            castShadow
            receiveShadow
          >
            <primitive object={createLowPolyMountainGeometry(peakSeed)} />
            <meshLambertMaterial 
              color="#8B7355"
              flatShading={true} // Low-poly flat shading
            />
          </mesh>
        );
      })}
      
      {/* Rocky outcroppings near the base (closer to path) */}
      {Array.from({ length: 6 + Math.floor(seededRandom(seed + 100) * 4) }, (_, i) => {
        const rockSeed = seed + i * 73 + 1000;
        const rockX = (seededRandom(rockSeed) - 0.5) * 16;
        const rockY = -1 + seededRandom(rockSeed + 1) * 4;
        const rockZ = 8 + seededRandom(rockSeed + 2) * 8; // Position rocks closer to path
        const rockScale = 0.8 + seededRandom(rockSeed + 3) * 1.0;
        
        // Different rock types for variety
        const rockType = Math.floor(seededRandom(rockSeed + 4) * 3);
        let geometry;
        
        switch (rockType) {
          case 0:
            geometry = <boxGeometry args={[2, 2, 2]} />;
            break;
          case 1:
            geometry = <dodecahedronGeometry args={[1.5]} />;
            break;
          default:
            geometry = <octahedronGeometry args={[1.8]} />;
        }
        
        return (
          <mesh
            key={`rock-${i}`}
            position={[rockX, rockY, rockZ]}
            rotation={[
              seededRandom(rockSeed + 5) * 0.5,
              seededRandom(rockSeed + 6) * Math.PI * 2,
              seededRandom(rockSeed + 7) * 0.3
            ]}
            scale={[rockScale, rockScale, rockScale]}
            castShadow
            receiveShadow
          >
            {geometry}
            <meshLambertMaterial 
              color={rockType === 0 ? "#4CAF50" : rockType === 1 ? "#8D6E63" : "#A0522D"}
              flatShading={true}
            />
          </mesh>
        );
      })}
      
      {/* Collision barriers - closer to accommodate new mountain shape */}
      <mesh
        position={[side === 'left' ? 12 : -12, 15, 5]}
        visible={false}
      >
        <boxGeometry args={[20, 30, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export const BoundaryMountainSystem: React.FC<BoundaryMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainClusters = useMemo(() => {
    const clusters = [];
    
    // Process fewer chunks for better performance
    const processedChunks = chunks.slice(0, 3);
    
    processedChunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      
      // Left side mountains - closer to path
      const leftClusterCount = 1 + Math.floor(seededRandom(seed + 100) * 1);
      for (let i = 0; i < leftClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 1000;
        const x = -16 - seededRandom(clusterSeed) * 4; // Closer to path (was -22)
        const z = worldZ - (i * 40) - seededRandom(clusterSeed + 1) * 15;
        const scale = 1.2 + seededRandom(clusterSeed + 2) * 0.8;
        
        clusters.push({
          x, y: 0, z, scale, seed: clusterSeed,
          chunkId: chunk.id, side: 'left' as const, index: i
        });
      }
      
      // Right side mountains - closer to path
      const rightClusterCount = 1 + Math.floor(seededRandom(seed + 200) * 1);
      for (let i = 0; i < rightClusterCount; i++) {
        const clusterSeed = seed + i * 89 + 2000;
        const x = 16 + seededRandom(clusterSeed) * 4; // Closer to path (was +22)
        const z = worldZ - (i * 40) - seededRandom(clusterSeed + 1) * 15;
        const scale = 1.2 + seededRandom(clusterSeed + 2) * 0.8;
        
        clusters.push({
          x, y: 0, z, scale, seed: clusterSeed,
          chunkId: chunk.id, side: 'right' as const, index: i
        });
      }
    });
    
    return clusters;
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainClusters.map((cluster) => (
        <OptimizedMountainCluster
          key={`optimized_mountain_${cluster.chunkId}_${cluster.side}_${cluster.index}`}
          position={[cluster.x, cluster.y, cluster.z]}
          seed={cluster.seed}
          scale={cluster.scale}
          side={cluster.side}
        />
      ))}
    </group>
  );
};

import React, { useMemo, Suspense } from 'react';
import { FogChunkData } from '../components/FogBasedChunkSystem';
import * as THREE from 'three';
import { useRegisterCollider } from '@/lib/CollisionContext';

interface EnhancedTreeDistributionProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// ENHANCED terrain height simulation function for proper grounding
const getTerrainHeight = (x: number, z: number): number => {
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.5 + 
                     Math.sin(x * 0.005) * Math.cos(z * 0.005) * 1.0;
  const jitter = (Math.sin(x * 0.1) * Math.cos(z * 0.1)) * 0.1;
  return Math.max(0, baseHeight + jitter);
};

// ENHANCED: Calculate proper mountain slope height for tree grounding
const getMountainSlopeHeight = (x: number, z: number): number => {
  const distanceFromCenter = Math.abs(x);
  
  // Valley floor (close to path)
  if (distanceFromCenter < 15) {
    return getTerrainHeight(x, z);
  }
  
  // Mountain slope calculation - gradual rise
  const slopeStart = 15;
  const slopeDistance = distanceFromCenter - slopeStart;
  const slopeAngle = 0.15; // Gentle slope
  const baseTerrainHeight = getTerrainHeight(x, z);
  const mountainHeight = slopeDistance * slopeAngle;
  
  // Add some natural variation to the slope
  const variation = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 0.3;
  
  return baseTerrainHeight + mountainHeight + variation;
};

// Check if position is on a steep slope (>45°)
const isOnSteepSlope = (x: number, z: number): boolean => {
  const sampleDistance = 1.5;
  const centerHeight = getMountainSlopeHeight(x, z);
  const northHeight = getMountainSlopeHeight(x, z - sampleDistance);
  const southHeight = getMountainSlopeHeight(x, z + sampleDistance);
  const eastHeight = getMountainSlopeHeight(x + sampleDistance, z);
  const westHeight = getMountainSlopeHeight(x - sampleDistance, z);
  
  const maxSlope = Math.max(
    Math.abs(centerHeight - northHeight),
    Math.abs(centerHeight - southHeight),
    Math.abs(centerHeight - eastHeight),
    Math.abs(centerHeight - westHeight)
  ) / sampleDistance;
  
  return maxSlope > 0.8; // Increased threshold for steeper slopes
};

// Check if position is in the main player path corridor
const isInPlayerPath = (x: number, z: number): boolean => {
  const pathWidth = 10;
  return Math.abs(x) < pathWidth;
};

// Check if position is too close to player starting position
const isTooCloseToPlayerStart = (x: number, z: number): boolean => {
  const distance = Math.sqrt(x * x + (z + 10) * (z + 10));
  return distance < 6;
};

// Check if position is within the central valley near the path
const isInMountainBoundary = (x: number, z: number): boolean => {
  const mountainBuffer = 5;
  return Math.abs(x) < mountainBuffer;
};

// ENHANCED tree positioning with proper grounding
const isValidTreePosition = (x: number, z: number): boolean => {
  const notInPlayerPath = !isInPlayerPath(x, z);
  const inValidXRange = Math.abs(x) >= 4 && Math.abs(x) <= 150;
  const notOnSteepSlope = !isOnSteepSlope(x, z);
  const notTooCloseToPlayer = !isTooCloseToPlayerStart(x, z);
  const notInMountainBoundary = !isInMountainBoundary(x, z);
  
  return notInPlayerPath && inValidXRange && notOnSteepSlope && notTooCloseToPlayer && notInMountainBoundary;
};

// Get tree type
const getTreeType = (seed: number): 'realistic' | 'stylized' | 'pine218' => {
  const random = seededRandom(seed);
  if (random < 0.7) return 'pine218';
  if (random < 0.9) return 'stylized';
  return 'realistic';
};

// Get randomized scale based on tree type
const getTreeScale = (treeType: 'realistic' | 'stylized' | 'pine218', seed: number): number => {
  const scaleConfig = {
    realistic: { min: 0.8, max: 1.2 },
    stylized: { min: 0.9, max: 1.1 },
    pine218: { min: 0.7, max: 1.3 }
  };
  const random = seededRandom(seed);
  return scaleConfig[treeType].min + (random * (scaleConfig[treeType].max - scaleConfig[treeType].min));
};

// Simple stylized tree like in reference image
const SimpleStylizedTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
}> = ({ position, scale, rotation }) => {
  // Simple ground positioning - trees sit on grass level
  const adjustedPosition: [number, number, number] = [
    position[0],
    -2.0 + 1.0, // Sit on grass level with trunk base at ground
    position[2]
  ];

  useRegisterCollider(
    `tree-${position[0]}-${position[2]}`,
    new THREE.Vector3(...adjustedPosition),
    scale
  );

  return (
    <group 
      position={adjustedPosition} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
    >
      {/* Brown cylindrical trunk - simple and clean */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.8, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Bright green spherical canopy - matches reference exactly */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshLambertMaterial color="#4CAF50" />
      </mesh>
    </group>
  );
};

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  const treePositions = useMemo(() => {
    if (realm !== 'fantasy') {
      return [];
    }

    console.log('EnhancedTreeDistribution: Generating simple stylized trees like reference image');
    const trees = [];

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      const treeCount = 3; // Fixed count for consistent sparse placement
      
      for (let i = 0; i < treeCount; i++) {
        const treeSeed = seed + i * 157;

        // Position trees on the grass areas (left and right of path)
        const side = i % 2 === 0 ? -1 : 1; // Alternate left and right
        const x = side * (8 + seededRandom(treeSeed) * 6); // Position on grass areas
        const z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.6;
        
        // Simple scale variation
        const scale = 0.8 + seededRandom(treeSeed + 2) * 0.4; // 0.8 to 1.2 scale
        const rotation = seededRandom(treeSeed + 3) * Math.PI * 2;
        
        // Only add if not too close to path center and not too close to player start
        const distanceToPath = Math.abs(x);
        const distanceToPlayerStart = Math.sqrt(x * x + (z + 10) * (z + 10));
        
        if (distanceToPath > 6 && distanceToPlayerStart > 8) {
          trees.push({ x, y: -2.0, z, scale, rotation });
        }
      }
    });
    
    console.log(`EnhancedTreeDistribution: Generated ${trees.length} stylized trees`);
    return trees;
  }, [chunks.map(c => `${c.id}-${c.x}-${c.z}`).join(','), chunkSize, realm]);

  if (realm !== 'fantasy' || treePositions.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <group>
        {treePositions.map((tree, index) => (
          <SimpleStylizedTree
            key={`tree-${index}`}
            position={[tree.x, tree.y, tree.z]}
            scale={tree.scale}
            rotation={tree.rotation}
          />
        ))}
      </group>
    </Suspense>
  );
};

// Clear cache when component unmounts - no longer needed
export const clearTreeModelCache = () => {
  console.log('Tree model cache cleared (procedural trees)');
};

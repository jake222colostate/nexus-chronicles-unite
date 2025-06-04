
import React, { useMemo, Suspense, useRef, useState, useEffect } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeAssetManager, TREE_MODELS, TREE_SCALES, TREE_Y_OFFSETS } from './TreeAssetManager';

interface EnhancedTreeDistributionProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Terrain height simulation function
const getTerrainHeight = (x: number, z: number): number => {
  const baseHeight = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 1.5 + 
                     Math.sin(x * 0.005) * Math.cos(z * 0.005) * 2.5;
  const jitter = (Math.sin(x * 0.1) * Math.cos(z * 0.1)) * 0.15;
  return baseHeight + jitter;
};

// Check if position is on a steep slope (>45°)
const isOnSteepSlope = (x: number, z: number): boolean => {
  const sampleDistance = 1.5;
  const centerHeight = getTerrainHeight(x, z);
  const northHeight = getTerrainHeight(x, z - sampleDistance);
  const southHeight = getTerrainHeight(x, z + sampleDistance);
  const eastHeight = getTerrainHeight(x + sampleDistance, z);
  const westHeight = getTerrainHeight(x - sampleDistance, z);
  
  const maxSlope = Math.max(
    Math.abs(centerHeight - northHeight),
    Math.abs(centerHeight - southHeight),
    Math.abs(centerHeight - eastHeight),
    Math.abs(centerHeight - westHeight)
  ) / sampleDistance;
  
  return maxSlope > 0.8;
};

// Check if position is too close to player path
const isOnPlayerPath = (x: number, z: number): boolean => {
  return Math.abs(x) < 4;
};

// Check if position is too close to player starting position
const isTooCloseToPlayerStart = (x: number, z: number): boolean => {
  const distance = Math.sqrt(x * x + (z + 10) * (z + 10));
  return distance < 8;
};

// Get tree type with 33% distribution
const getTreeType = (seed: number): 'realistic' | 'stylized' | 'pine' => {
  const random = seededRandom(seed);
  if (random < 0.33) return 'realistic';
  if (random < 0.66) return 'stylized';
  return 'pine';
};

// Fallback tree component using basic geometry
const FallbackTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine';
}> = ({ position, scale, rotation, treeType }) => {
  const getTreeGeometry = () => {
    switch (treeType) {
      case 'pine':
        return (
          <group>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.15, 1]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.6, 1.5, 8]} />
              <meshLambertMaterial color="#013220" />
            </mesh>
          </group>
        );
      case 'stylized':
        return (
          <group>
            <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.12, 0.18, 1.2]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.8, 12, 8]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
          </group>
        );
      default: // realistic
        return (
          <group>
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.2, 1.6]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1.0, 12, 8]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
          </group>
        );
    }
  };

  return (
    <group 
      position={position} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
    >
      {getTreeGeometry()}
    </group>
  );
};

// Individual tree instance component with cached model loading
const TreeInstance: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine';
  playerPosition: THREE.Vector3;
}> = ({ position, scale, rotation, treeType, playerPosition }) => {
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef<THREE.Group>(null);

  // Performance culling based on distance
  useFrame(() => {
    if (groupRef.current) {
      const distance = playerPosition.distanceTo(new THREE.Vector3(...position));
      const newVisibility = distance <= 150; // 150m culling distance
      
      if (newVisibility !== isVisible) {
        setIsVisible(newVisibility);
      }

      // LOD scaling for distant trees
      if (distance > 20) {
        groupRef.current.visible = distance <= 50; // Hide very distant trees
      } else {
        groupRef.current.visible = true;
      }
    }
  });

  if (!isVisible) {
    return null;
  }

  // Try to get cached model first
  const cachedModel = TreeAssetManager.getCachedModel(treeType);
  
  if (cachedModel) {
    // Apply optimizations to cached model
    cachedModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = true;
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.side = THREE.DoubleSide;
              mat.needsUpdate = true;
            });
          } else {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      }
    });

    const finalScale = scale * TREE_SCALES[treeType];
    const yOffset = TREE_Y_OFFSETS[treeType];

    return (
      <group 
        ref={groupRef}
        position={[position[0], position[1] + yOffset, position[2]]} 
        scale={[finalScale, finalScale, finalScale]} 
        rotation={[0, rotation, 0]}
      >
        <primitive object={cachedModel} />
      </group>
    );
  }

  // Fallback to basic geometry if model not loaded
  return (
    <FallbackTree 
      position={position} 
      scale={scale * TREE_SCALES[treeType]} 
      rotation={rotation} 
      treeType={treeType}
    />
  );
};

// Performance-optimized tree group with frame throttling
const InstancedTreeGroup: React.FC<{
  positions: Array<{ 
    x: number; 
    y: number; 
    z: number; 
    scale: number; 
    rotation: number; 
    treeType: 'realistic' | 'stylized' | 'pine';
  }>;
  playerPosition: THREE.Vector3;
}> = ({ positions, playerPosition }) => {
  const [renderedCount, setRenderedCount] = useState(0);
  const maxTreesPerFrame = 3;

  // Frame throttling - render only 3 trees per frame
  useFrame(() => {
    if (renderedCount < Math.min(positions.length, 50)) { // Max 50 trees total
      setRenderedCount(prev => Math.min(prev + maxTreesPerFrame, Math.min(positions.length, 50)));
    }
  });

  const visiblePositions = positions
    .slice(0, renderedCount)
    .filter(pos => {
      const distance = playerPosition.distanceTo(new THREE.Vector3(pos.x, pos.y, pos.z));
      return distance <= 150;
    });

  return (
    <group name="TreeGroup">
      {visiblePositions.map((pos, index) => (
        <TreeInstance
          key={`tree-${index}-${pos.treeType}`}
          position={[pos.x, pos.y, pos.z]}
          scale={pos.scale}
          rotation={pos.rotation}
          treeType={pos.treeType}
          playerPosition={playerPosition}
        />
      ))}
    </group>
  );
};

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [isReady, setIsReady] = useState(false);
  const [realmSwitchDelay, setRealmSwitchDelay] = useState(false);
  const previousRealm = useRef<'fantasy' | 'scifi'>(realm);

  // Generate tree positions with optimized algorithm - MOVED TO TOP
  const { treePositions, playerPosition } = useMemo(() => {
    // Only generate if ready and in fantasy realm
    if (realm !== 'fantasy' || !isReady || realmSwitchDelay) {
      return {
        treePositions: [],
        playerPosition: new THREE.Vector3(0, 0, 0)
      };
    }

    console.log('EnhancedTreeDistribution: Generating tree positions for', chunks.length, 'chunks');
    const trees = [];
    const minDistance = 3; // 3m minimum distance
    const maxAttempts = 25;
    const allPositions = [];

    chunks.forEach(chunk => {
      const { worldX, worldZ, seed } = chunk;
      
      // Generate 2-4 trees per chunk
      const treeCount = 2 + Math.floor(seededRandom(seed) * 3);
      
      for (let i = 0; i < treeCount; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, z, terrainHeight, treeType, scale, rotation, finalY;
        
        while (!validPosition && attempts < maxAttempts) {
          const treeSeed = seed + i * 157;
          
          // Random placement within chunk bounds
          x = worldX + (seededRandom(treeSeed) - 0.5) * chunkSize * 0.8;
          z = worldZ + (seededRandom(treeSeed + 1) - 0.5) * chunkSize * 0.8;
          
          terrainHeight = getTerrainHeight(x, z);
          
          // Skip invalid positions
          if (isOnPlayerPath(x, z) || isOnSteepSlope(x, z) || isTooCloseToPlayerStart(x, z)) {
            attempts++;
            continue;
          }
          
          // Get tree type with 33% distribution
          treeType = getTreeType(treeSeed + 2);
          
          // Base scale with some variation
          scale = 0.8 + seededRandom(treeSeed + 3) * 0.4; // 0.8 to 1.2
          
          // Random Y-axis rotation
          rotation = seededRandom(treeSeed + 4) * Math.PI * 2;
          
          finalY = terrainHeight;
          
          // Check minimum distance from existing trees
          validPosition = allPositions.every(pos => {
            const distance = Math.sqrt(
              Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2)
            );
            return distance >= minDistance;
          });
          
          attempts++;
        }
        
        if (validPosition) {
          const position = { x, y: finalY, z, scale, rotation, treeType };
          allPositions.push(position);
          trees.push(position);
        }
      }
    });
    
    // Player position for distance calculations
    const avgX = chunks.reduce((sum, chunk) => sum + chunk.worldX, 0) / chunks.length;
    const avgZ = chunks.reduce((sum, chunk) => sum + chunk.worldZ, 0) / chunks.length;
    
    console.log(`EnhancedTreeDistribution: Generated ${trees.length} trees`);
    
    return {
      treePositions: trees,
      playerPosition: new THREE.Vector3(avgX, 0, avgZ)
    };
  }, [chunks.map(c => c.id).join(','), chunkSize, realm, isReady, realmSwitchDelay]);

  // Handle realm switching with delay and cleanup
  useEffect(() => {
    if (previousRealm.current !== realm) {
      console.log(`EnhancedTreeDistribution: Realm switch detected (${previousRealm.current} -> ${realm})`);
      
      if (realm === 'fantasy') {
        // Clear existing trees and add delay before regenerating
        setIsReady(false);
        setRealmSwitchDelay(true);
        
        const delayTimeout = setTimeout(() => {
          console.log('EnhancedTreeDistribution: Post-transition delay complete, regenerating trees');
          setRealmSwitchDelay(false);
          setIsReady(true);
        }, 350); // 350ms delay as requested
        
        return () => clearTimeout(delayTimeout);
      } else {
        setIsReady(false);
      }
      
      previousRealm.current = realm;
    } else if (realm === 'fantasy' && !realmSwitchDelay) {
      setIsReady(true);
    }
  }, [realm, realmSwitchDelay]);

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  // Only render for fantasy realm when ready
  if (realm !== 'fantasy' || !isReady || realmSwitchDelay) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {treePositions.length > 0 && (
        <InstancedTreeGroup
          positions={treePositions}
          playerPosition={playerPosition}
        />
      )}
    </Suspense>
  );
};

// Clear cache when component unmounts
export const clearTreeModelCache = () => {
  TreeAssetManager.clearCache();
};

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

// ENHANCED Tree component with proper ground connection
const GLBTree: React.FC<{
  position: [number, number, number];
  scale: number;
  rotation: number;
  treeType: 'realistic' | 'stylized' | 'pine218';
}> = ({ position, scale, rotation, treeType }) => {
  // Create procedural tree geometry
  const treeModel = useMemo(() => {
    const group = new THREE.Group();
    // Simple procedural tree
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
      new THREE.MeshStandardMaterial({ color: '#8b4513' })
    );
    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 6),
      new THREE.MeshStandardMaterial({ color: '#32cd32' })
    );
    foliage.position.y = 1.5;
    group.add(trunk, foliage);
    return group;
  }, [treeType]);

  const optimizedModel = useMemo(() => {
    if (!treeModel) return null;

    const model = treeModel.clone();
    
    // Apply optimization settings but ALLOW fog
    const applyOptimizationRecursive = (object: THREE.Object3D) => {
      object.frustumCulled = false;
      object.matrixAutoUpdate = true;
      object.matrixWorldNeedsUpdate = true;
      object.visible = true;
      
      if (object instanceof THREE.Mesh) {
        // Expand bounding boxes for better visibility
        if (object.geometry) {
          object.geometry.computeBoundingBox();
          object.geometry.computeBoundingSphere();
          
          if (object.geometry.boundingBox) {
            object.geometry.boundingBox.expandByScalar(2.0);
          }
          if (object.geometry.boundingSphere) {
            object.geometry.boundingSphere.radius += 2.0;
          }
        }
        
        // Configure materials to work with fog
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(mat => {
            mat.side = THREE.DoubleSide;
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.visible = true;
            mat.depthTest = true;
            mat.depthWrite = true;
            mat.needsUpdate = true;
          });
        }
        
        object.castShadow = true;
        object.receiveShadow = true;
        object.renderOrder = 0;
      }
      
      // Apply to all children recursively
      object.children.forEach(child => applyOptimizationRecursive(child));

      object.updateMatrixWorld(true);
    };

    applyOptimizationRecursive(model);
    model.updateMatrixWorld(true);
    return model;
  }, [treeModel]);

  // ENHANCED: Proper ground connection with mountain slope calculation
  const groundHeight = getMountainSlopeHeight(position[0], position[2]);
  const treeOffsets = { realistic: 0, stylized: 0, pine218: 0 };
  const adjustedY = groundHeight + treeOffsets[treeType] - 1.8; // Offset for proper grounding

  const adjustedPosition: [number, number, number] = [
    position[0],
    adjustedY,
    position[2]
  ];

  useRegisterCollider(
    `tree-${position[0]}-${position[2]}`,
    new THREE.Vector3(...adjustedPosition),
    scale
  );

  if (!optimizedModel) {
    return (
      <group 
        position={adjustedPosition} 
        scale={[scale, scale, scale]} 
        rotation={[0, rotation, 0]}
        frustumCulled={false}
        matrixAutoUpdate={true}
        renderOrder={1}
      >
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow frustumCulled={false}>
          <cylinderGeometry args={[0.1, 0.15, 1]} />
          <meshLambertMaterial 
            color="#8B4513" 
            side={THREE.DoubleSide} 
            transparent={false}
          />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow frustumCulled={false}>
          <coneGeometry args={[0.6, 1.5, 8]} />
          <meshLambertMaterial 
            color={treeType === 'pine218' ? "#013220" : "#228B22"} 
            side={THREE.DoubleSide} 
            transparent={false}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group 
      position={adjustedPosition} 
      scale={[scale, scale, scale]} 
      rotation={[0, rotation, 0]}
      frustumCulled={false}
      matrixAutoUpdate={true}
      renderOrder={1}
    >
      <primitive object={optimizedModel} frustumCulled={false} />
    </group>
  );
};

export const EnhancedTreeDistribution: React.FC<EnhancedTreeDistributionProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // DISABLED FOR PERFORMANCE - All trees removed
  console.log('EnhancedTreeDistribution: Disabled for performance');
  return null;
};

// Clear cache when component unmounts - no longer needed
export const clearTreeModelCache = () => {
  console.log('Tree model cache cleared (procedural trees)');
};

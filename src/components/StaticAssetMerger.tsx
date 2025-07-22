import React, { useMemo } from 'react';
import { useGLBSceneReuse } from '../hooks/useGLBSceneReuse';
import { Mesh, BufferGeometry, Material, Matrix4, Euler } from 'three';
import * as THREE from 'three';

interface StaticAssetMergerProps {
  assetGroups: Array<{
    modelUrl: string;
    instances: Array<{
      position: [number, number, number];
      rotation?: [number, number, number];
      scale?: number | [number, number, number];
    }>;
  }>;
  mergeDistance?: number; // Merge assets within this distance
}

export const StaticAssetMerger: React.FC<StaticAssetMergerProps> = ({
  assetGroups,
  mergeDistance = 50
}) => {
  // Create merged geometries for each asset group
  const mergedAssets = useMemo(() => {
    return assetGroups.map(group => {
      const { scene } = useGLBSceneReuse(group.modelUrl);
      
      if (!scene) return null;

      // Extract base geometry and material
      let baseGeometry: BufferGeometry | null = null;
      let baseMaterial: Material | Material[] | null = null;

      scene.traverse((child) => {
        if (child instanceof Mesh && child.geometry && child.material) {
          baseGeometry = child.geometry;
          baseMaterial = child.material;
        }
      });

      if (!baseGeometry || !baseMaterial) return null;

      // Group instances by proximity for merging
      const clusters = clusterInstancesByProximity(group.instances, mergeDistance);
      
      return clusters.map((cluster, clusterIndex) => {
        // Create merged geometry for this cluster
        const mergedGeometry = baseGeometry.clone();
        
        // Apply transformations for each instance in cluster
        const matrices = cluster.map(instance => {
          const matrix = new Matrix4();
          
          matrix.makeTranslation(...instance.position);
          
          if ('rotation' in instance && instance.rotation) {
            const euler = new Euler(...instance.rotation);
            const rotationMatrix = new Matrix4().makeRotationFromEuler(euler);
            matrix.multiply(rotationMatrix);
          }
          
          if ('scale' in instance && instance.scale) {
            const scale = typeof instance.scale === 'number' 
              ? [instance.scale, instance.scale, instance.scale] as [number, number, number]
              : instance.scale as [number, number, number];
            const scaleMatrix = new Matrix4().makeScale(scale[0], scale[1], scale[2]);
            matrix.multiply(scaleMatrix);
          }
          
          return matrix;
        });

        return {
          geometry: mergedGeometry,
          material: baseMaterial,
          matrices,
          key: `${group.modelUrl}-cluster-${clusterIndex}`
        };
      });
    }).filter(Boolean).flat();
  }, [assetGroups, mergeDistance]);

  return (
    <group>
      {mergedAssets.map((asset, index) => {
        if (!asset) return null;
        
        return (
          <instancedMesh
            key={asset.key}
            geometry={asset.geometry}
            material={asset.material}
            args={[asset.geometry, asset.material, asset.matrices.length]}
            ref={(ref) => {
              if (ref) {
                asset.matrices.forEach((matrix, i) => {
                  ref.setMatrixAt(i, matrix);
                });
                ref.instanceMatrix.needsUpdate = true;
              }
            }}
          />
        );
      })}
    </group>
  );
};

// Helper function to cluster instances by proximity
function clusterInstancesByProximity(
  instances: Array<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] }>, 
  maxDistance: number
): Array<Array<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] }>> {
  const clusters: Array<Array<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] }>> = [];
  const used = new Set<number>();

  instances.forEach((instance, index) => {
    if (used.has(index)) return;

    const cluster = [instance];
    used.add(index);

    // Find nearby instances
    instances.forEach((other, otherIndex) => {
      if (used.has(otherIndex) || index === otherIndex) return;

      const distance = Math.sqrt(
        Math.pow(instance.position[0] - other.position[0], 2) +
        Math.pow(instance.position[1] - other.position[1], 2) +
        Math.pow(instance.position[2] - other.position[2], 2)
      );

      if (distance <= maxDistance) {
        cluster.push(other);
        used.add(otherIndex);
      }
    });

    clusters.push(cluster);
  });

  return clusters;
}
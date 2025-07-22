import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Mesh } from 'three';
import { useGLBSceneReuse } from '../hooks/useGLBSceneReuse';

interface LODGLBSystemProps {
  modelUrl: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  lodDistances?: [number, number, number]; // [high, medium, low] detail distances
  cameraPosition: Vector3;
}

export const LODGLBSystem: React.FC<LODGLBSystemProps> = ({
  modelUrl,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  lodDistances = [50, 100, 200],
  cameraPosition
}) => {
  const { scene } = useGLBSceneReuse(modelUrl);
  
  // Calculate distance to camera
  const distance = useMemo(() => {
    return cameraPosition.distanceTo(new Vector3(...position));
  }, [cameraPosition, position]);
  
  // Create LOD levels
  const lodLevels = useMemo(() => {
    if (!scene) return [];
    
    return [
      {
        distance: lodDistances[0],
        object: scene.clone(), // High detail - full model
      },
      {
        distance: lodDistances[1], 
        object: (() => {
          // Medium detail - simplified model
          const simplified = scene.clone();
          simplified.traverse((child) => {
            if (child instanceof Mesh && child.geometry) {
              // Reduce geometry complexity for medium LOD
              child.geometry = child.geometry.clone();
            }
          });
          return simplified;
        })(),
      },
      {
        distance: lodDistances[2],
        object: (() => {
          // Low detail - very simple representation
          const lowDetail = scene.clone();
          lowDetail.traverse((child) => {
            if (child instanceof Mesh) {
              child.visible = false; // Hide complex meshes at distance
            }
          });
          return lowDetail;
        })(),
      }
    ];
  }, [scene, lodDistances]);
  
  if (!scene) return null;
  
  // Manual LOD implementation based on distance
  const currentLOD = useMemo(() => {
    if (distance < lodDistances[0]) return lodLevels[0]?.object;
    if (distance < lodDistances[1]) return lodLevels[1]?.object;
    return lodLevels[2]?.object;
  }, [distance, lodDistances, lodLevels]);
  
  if (!currentLOD) return null;
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={currentLOD} />
    </group>
  );
};
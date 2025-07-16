
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface TreeComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export const TreeComponent: React.FC<TreeComponentProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/tree_draco.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Create tree trunk material
    const treeTrunkMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.4, 0.2, 0.0), // Dark brown
      roughness: 0.7,
      metalness: 0.0
    });

    // Create tree foliage material with emission
    const treeFoliageMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(120/360, 0.8, 0.5), // HSV(120°, 80%, 50%)
      emissive: new THREE.Color(0.05, 0.15, 0.05),
      emissiveIntensity: 0.15
    });

    // Apply materials to tree parts
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name.toLowerCase().includes('trunk')) {
          child.material = treeTrunkMaterial;
          child.castShadow = true;
        } else if (child.name.toLowerCase().includes('foliage')) {
          child.material = treeFoliageMaterial;
          child.castShadow = true;
        }
      }
    });

    return clone;
  }, [scene]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

// Preload the Draco-compressed model
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/tree_draco.glb');
console.log('TreeComponent: Preloading Draco-compressed tree model');

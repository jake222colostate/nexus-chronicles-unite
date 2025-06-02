
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ArchwayComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export const ArchwayComponent: React.FC<ArchwayComponentProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/archway.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Create archway material
    const archwayMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.4, 0.4, 0.4), // Medium-gray stone
      roughness: 0.85,
      metalness: 0.0
    });

    // Apply material to archway meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('archway')) {
        child.material = archwayMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
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

// Preload the model
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/archway.glb');

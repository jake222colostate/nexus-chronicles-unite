
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MountainComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export const MountainComponent: React.FC<MountainComponentProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/mountain.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Create mountain material with purple-toned hue
    const mountainMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.5, 0.3, 0.6), // Purple-toned
      roughness: 0.9,
      metalness: 0.0
    });

    // Apply material to mountain meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('mountain')) {
        child.material = mountainMaterial;
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
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/mountain.glb');

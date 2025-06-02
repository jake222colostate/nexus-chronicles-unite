
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SkyDomeComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export const SkyDomeComponent: React.FC<SkyDomeComponentProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/skydome.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Create gradient sky dome material
    const skyDomeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.6, 0.2, 0.5), // Zenith color
      side: THREE.BackSide // Render inside of sphere
    });

    // Apply material to sky dome meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('skydome')) {
        child.material = skyDomeMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
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
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/skydome.glb');

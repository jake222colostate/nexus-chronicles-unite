
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface TerrainComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export const TerrainComponent: React.FC<TerrainComponentProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/terrain.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Create terrain material
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.2, 0.5, 0.2), // Mid-green
      roughness: 0.9,
      metalness: 0.0
    });

    // Apply material to terrain meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('terrain')) {
        child.material = terrainMaterial;
        child.castShadow = false;
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
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/terrain.glb');


import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CrystalComponentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  animate?: boolean;
}

export const CrystalComponent: React.FC<CrystalComponentProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  animate = true
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/crystal.glb');
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Create crystal material with emission
    const crystalMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(0.05, 0.8, 0.8), // Bright cyan-teal
      emissive: new THREE.Color(0.05, 0.8, 0.8),
      emissiveIntensity: 1.2
    });

    // Apply material to crystal meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('crystal')) {
        child.material = crystalMaterial;
        child.castShadow = true;
      }
    });

    return clone;
  }, [scene]);

  // Animate crystal with subtle bobbing
  useFrame((state, delta) => {
    if (animate && groupRef.current) {
      timeRef.current += delta;
      const baseY = position[1];
      const bobAmount = 0.3;
      
      // Smooth sine wave animation
      groupRef.current.position.y = baseY + Math.sin(timeRef.current * 2) * bobAmount;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
      
      {/* Point light for crystal glow */}
      <pointLight
        position={[0, 1, 0]}
        color={new THREE.Color(0.05, 0.8, 0.8)}
        intensity={1.5}
        distance={6}
        castShadow={false}
      />
    </group>
  );
};

// Preload the model
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/UpdatedModels/main/crystal.glb');

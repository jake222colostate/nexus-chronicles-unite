
import React, { useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Mesh, Group } from 'three';

interface GLBModelProps {
  modelUrl: string;
  position: [number, number, number];
  onClick: () => void;
  name: string;
}

export const GLBModel: React.FC<GLBModelProps> = ({ modelUrl, position, onClick, name }) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load the GLB model
  const gltf = useLoader(GLTFLoader, modelUrl);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      
      // Gentle rotation when hovered
      if (hovered) {
        groupRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <primitive object={gltf.scene} />
    </group>
  );
};

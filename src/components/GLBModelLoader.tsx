
import React, { useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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
  const [error, setError] = useState(false);
  
  // Use useGLTF hook from drei with error handling
  let gltf;
  try {
    gltf = useGLTF(modelUrl);
  } catch (err) {
    console.error(`Failed to load model ${name}:`, err);
    setError(true);
  }
  
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

  // Fallback geometry if model fails to load
  if (error || !gltf) {
    return (
      <group
        ref={groupRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {/* Fallback crystal shape */}
        <mesh>
          <octahedronGeometry args={[0.8]} />
          <meshLambertMaterial color="#8b5cf6" transparent opacity={0.8} />
        </mesh>
        {/* Floating text indicator */}
        <mesh position={[0, 1.2, 0]}>
          <planeGeometry args={[2, 0.4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>
    );
  }

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

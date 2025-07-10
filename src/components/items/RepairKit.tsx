import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface RepairKitProps {
  position: [number, number, number];
  onPickup?: () => void;
  realm?: 'fantasy' | 'scifi';
}

export const RepairKit: React.FC<RepairKitProps> = ({ position, onPickup, realm = 'scifi' }) => {
  const meshRef = useRef<Mesh>(null);

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y += 0.02;
    }
  });

  const handleClick = () => {
    if (realm === 'scifi') {
      onPickup?.();
    }
  };

  return (
    <group position={position}>
      {/* Main toolbox body */}
      <mesh ref={meshRef} onClick={handleClick}>
        <boxGeometry args={[0.4, 0.2, 0.25]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Toolbox lid */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.42, 0.04, 0.27]} />
        <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Handle */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Latch */}
      <mesh position={[0, 0.05, 0.13]}>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Corner reinforcements */}
      <mesh position={[-0.18, -0.05, -0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.18, -0.05, -0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.18, -0.05, 0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.18, -0.05, 0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Glow effect */}
      <pointLight color="#ffd700" intensity={0.3} distance={3} decay={2} />
    </group>
  );
};
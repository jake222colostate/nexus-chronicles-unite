import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface RepairKitProps {
  position: [number, number, number];
  onPickup?: () => void;
}

export const RepairKit: React.FC<RepairKitProps> = ({ position, onPickup }) => {
  const meshRef = useRef<Mesh>(null);

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y += 0.02;
    }
  });

  const handleClick = () => {
    onPickup?.();
  };

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={handleClick}>
        {/* Main repair kit body */}
        <boxGeometry args={[0.3, 0.15, 0.2]} />
        <meshStandardMaterial color="#ff4444" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Cross symbol on top */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.15, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.03, 0.15, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Glow effect */}
      <pointLight color="#ff4444" intensity={0.5} distance={2} decay={2} />
    </group>
  );
};
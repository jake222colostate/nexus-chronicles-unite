
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface Projectile3DProps {
  position: [number, number, number];
  realm: 'fantasy' | 'scifi';
}

export const Projectile3D: React.FC<Projectile3DProps> = ({ position, realm }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate projectile for visual effect
      meshRef.current.rotation.x += 0.2;
      meshRef.current.rotation.y += 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {realm === 'fantasy' ? (
        <>
          {/* Magic orb */}
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshBasicMaterial color="#ffff00" emissive="#ffaa00" />
        </>
      ) : (
        <>
          {/* Laser bolt */}
          <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
          <meshBasicMaterial color="#00ffff" emissive="#0088ff" />
        </>
      )}
      
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[0.15, 6, 4]} />
        <meshBasicMaterial 
          color={realm === 'fantasy' ? "#ffff00" : "#00ffff"} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </mesh>
  );
};

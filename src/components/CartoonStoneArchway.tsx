
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CartoonStoneArchway {
  realm: 'fantasy' | 'scifi';
}

export const CartoonStoneArchway: React.FC<CartoonStoneArchway> = ({ realm }) => {
  const portalRef = useRef<THREE.Mesh>(null);
  
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  useFrame((state) => {
    if (portalRef.current) {
      // Swirling portal effect
      portalRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group position={[0, 3, -15]}>
      {/* Left pillar */}
      <mesh position={[-3, 0, 0]}>
        <cylinderGeometry args={[0.8, 1, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      
      {/* Right pillar */}
      <mesh position={[3, 0, 0]}>
        <cylinderGeometry args={[0.8, 1, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      
      {/* Top arch */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[3.5, 0.5, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      
      {/* Magical portal inside */}
      <mesh ref={portalRef} position={[0, 1.5, -0.2]}>
        <ringGeometry args={[1, 2.5, 32]} />
        <meshBasicMaterial
          color="#9333EA"
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Portal particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 0.5) * 2,
            1.5 + Math.sin(i * 0.5) * 2,
            0
          ]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial
            color="#DDA0DD"
            emissive="#DDA0DD"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      {/* Portal light */}
      <pointLight
        position={[0, 1.5, 0]}
        color="#9333EA"
        intensity={1}
        distance={15}
      />
    </group>
  );
};

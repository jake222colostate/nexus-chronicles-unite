import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface VendorStallProps {
  type: 'magic' | 'tech';
  position: [number, number, number];
  color: string;
}

const VendorStall: React.FC<VendorStallProps> = ({ type, position, color }) => {
  const label = type === 'magic' ? 'Magic Vendor' : 'Tech Vendor';
  return (
    <group position={position}>
      {/* Stall base platform */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.5, 1]} />
        <meshStandardMaterial color="#6e3b1e" />
      </mesh>

      {/* Arched roof */}
      <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.2, 16, 32, Math.PI]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>

      {/* Roof cloth */}
      <mesh position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[1.2, 24, 24, 0, Math.PI]} />
        <meshStandardMaterial color={color} wireframe={false} />
      </mesh>

      {/* Decorative shelves */}
      <mesh position={[0.5, 0.6, 0.5]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>

      {/* Support beams */}
      {[[-0.9, -0.25], [0.9, -0.25]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 12]} />
          <meshStandardMaterial color="#3a1e0f" />
        </mesh>
      ))}

      {/* Label */}
      <Text position={[0, 1.8, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
};

export default VendorStall;

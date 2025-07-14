import React from 'react';
import { Text } from '@react-three/drei';

interface VendorStallProps {
  type: 'magic' | 'tech';
  position: [number, number, number];
  color: string;
}

const VendorStall: React.FC<VendorStallProps> = ({ type, position, color }) => {
  const label = type === 'magic' ? 'Magic Vendor' : 'Tech Vendor';
  return (
    <group position={position}>
      {/* Base table */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.8, 1]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[2.2, 0.2, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Support posts */}
      {[
        [-0.9, 0.8, -0.45],
        [0.9, 0.8, -0.45],
        [-0.9, 0.8, 0.45],
        [0.9, 0.8, 0.45]
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2]} />
          <meshStandardMaterial color="#654321" />
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

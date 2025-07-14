import React from 'react';

const FancyFence: React.FC = () =>
  [...Array(32)].map((_, i) => {
    const angle = (i / 32) * 2 * Math.PI;
    const x = Math.cos(angle) * 8;
    const z = Math.sin(angle) * 8;
    return (
      <group key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 1.2, 16]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
      </group>
    );
  });

export default FancyFence;

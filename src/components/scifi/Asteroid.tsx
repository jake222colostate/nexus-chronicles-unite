
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';

interface AsteroidProps {
  startPosition?: [number, number, number];
  speed?: number;
  onReachTarget?: () => void;
}

export const Asteroid: React.FC<AsteroidProps> = ({
  startPosition = [0, 5, -10],
  speed = 0.02,
  onReachTarget
}) => {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (group.current) {
      group.current.position.z += speed;
      if (group.current.position.z >= 0) {
        onReachTarget?.();
      }
    }
  });

  return (
    <group ref={group} position={new Vector3(...startPosition)}>
      <mesh scale={0.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  );
};

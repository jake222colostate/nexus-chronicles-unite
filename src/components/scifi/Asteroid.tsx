
import React, { useRef } from 'react';
import { useFBX } from '@react-three/drei';
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
  const fbx = useFBX('/assets/asteroid_01.fbx');

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
      <primitive object={fbx.clone()} scale={0.005} />
    </group>
  );
};

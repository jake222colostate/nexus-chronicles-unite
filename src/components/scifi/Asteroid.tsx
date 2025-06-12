
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { Html } from '@react-three/drei';
import { Progress } from '../ui/progress';

const MAX_HEALTH = 5;

interface AsteroidProps {
  startPosition?: [number, number, number];
  speed?: number;
  health: number;
  onReachTarget?: () => void;
}

export const Asteroid: React.FC<AsteroidProps> = ({
  startPosition = [0, 5, -10],
  speed = 0.02,
  health,
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
      <Html position={[0, 1, 0]} center style={{ pointerEvents: 'none' }} transform distanceFactor={8}>
        <div className="w-12">
          <Progress value={Math.max(0, (health / MAX_HEALTH) * 100)} className="h-1" indicatorClassName={health <= 1 ? 'bg-red-600' : 'bg-green-500'} />
        </div>
      </Html>
    </group>
  );
};

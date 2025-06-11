import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { Vector3, Group } from 'three';
import { Progress } from './ui/progress';
import { assetPath } from '../lib/assetPath';

interface LeechEnemyProps {
  playerPosition: Vector3;
  startPosition: Vector3;
  onReachPlayer?: () => void;
  visible?: boolean;
}

export const LeechEnemy: React.FC<LeechEnemyProps> = ({
  playerPosition,
  startPosition,
  onReachPlayer,
  visible = true
}) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(assetPath('assets/leech.glb'));
  const speed = 0.1;
  const [health] = useState(100);

  useFrame(() => {
    if (!groupRef.current || !visible) return;
    const dir = new Vector3();
    dir.subVectors(playerPosition, groupRef.current.position);
    const distance = dir.length();
    if (distance < 1) {
      onReachPlayer && onReachPlayer();
      return;
    }
    dir.normalize();
    groupRef.current.position.addScaledVector(dir, speed);
    groupRef.current.lookAt(playerPosition);
    groupRef.current.rotateY(Math.PI);
  });

  return (
    <group
      ref={groupRef}
      position={startPosition.toArray() as [number, number, number]}
      visible={visible}
    >
      <primitive object={scene.clone()} scale={0.6} rotation={[0, Math.PI, 0]} />
      <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="w-16">
          <Progress value={health} />
        </div>
      </Html>
    </group>
  );
};

useGLTF.preload(assetPath('assets/leech.glb'));

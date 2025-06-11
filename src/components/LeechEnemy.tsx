import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector3, Group } from 'three';
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
  });

  return (
    <primitive
      ref={groupRef}
      object={scene.clone()}
      scale={0.6}
      position={startPosition.toArray() as [number, number, number]}
      visible={visible}
    />
  );
};

useGLTF.preload(assetPath('assets/leech.glb'));

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { Vector3, Group } from 'three';
import { Progress } from './ui/progress';
import { assetPath } from '../lib/assetPath';

interface BatEnemyProps {
  playerPosition: Vector3;
  startPosition: Vector3;
  onReachPlayer?: () => void;
  visible?: boolean;
}

export const BatEnemy: React.FC<BatEnemyProps> = ({
  playerPosition,
  startPosition,
  onReachPlayer,
  visible = true
}) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(assetPath('assets/vampire-bat/source/bat.glb'));
  const speed = 0.15;
  const [health] = useState(100);

  useFrame(({ clock }) => {
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
    groupRef.current.position.y =
      startPosition.y + Math.sin(clock.elapsedTime * 2) * 0.5;
    groupRef.current.lookAt(playerPosition);
  });

  return (
    <group
      ref={groupRef}
      position={startPosition.toArray() as [number, number, number]}
      visible={visible}
    >
      <primitive object={scene.clone()} scale={0.6} rotation={[0, Math.PI, 0]} />
      <Html
        position={[0, 1.5, 0]}
        center
        style={{ pointerEvents: 'none' }}
        transform
        distanceFactor={8}
      >
        <div className="w-16">
          <Progress value={health} />
        </div>
      </Html>
    </group>
  );
};

useGLTF.preload(assetPath('assets/vampire-bat/source/bat.glb'));

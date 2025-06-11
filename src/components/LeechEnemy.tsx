
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { Vector3, Group } from 'three';
import { useCollisionContext } from '@/lib/CollisionContext';
import { Progress } from './ui/progress';
import { assetPath } from '../lib/assetPath';

interface LeechEnemyProps {
  playerPosition: Vector3;
  startPosition: Vector3;
  onReachPlayer?: () => void;
  onUpdatePosition?: (pos: Vector3) => void;
  health: number;
  visible?: boolean;
}

export const LeechEnemy: React.FC<LeechEnemyProps> = ({
  playerPosition,
  startPosition,
  onReachPlayer,
  onUpdatePosition,
  health,
  visible = true
}) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(assetPath('assets/leech.glb'));
  const speed = 0.1;
  const groundY = startPosition.y;
  const collision = useCollisionContext();

  const colliderIdRef = React.useRef<string>('');
  React.useEffect(() => {
    if (!collision) return;
    const id = `leech-${startPosition.x}-${startPosition.z}-${Math.random()}`;
    colliderIdRef.current = id;
    const collider = { id, position: startPosition.clone(), radius: 0.8 };
    collision.registerCollider(collider);
    return () => collision.removeCollider(id);
  }, [collision, startPosition]);

  useFrame(() => {
    if (!groupRef.current || !visible) return;
    const dir = new Vector3();
    dir.subVectors(playerPosition, groupRef.current.position);
    dir.y = 0; // stay on the ground
    const distance = dir.length();
    if (distance < 1) {
      onReachPlayer?.();
      return;
    }
    dir.normalize();
    const newPos = groupRef.current.position.clone().addScaledVector(dir, speed);
    let blocked = false;
    if (collision) {
      for (const col of collision.colliders.current.values()) {
        if (col.id === colliderIdRef.current) continue;
        if (newPos.distanceTo(col.position) < 0.8 + col.radius) {
          blocked = true;
          break;
        }
      }
    }
    if (!blocked) {
      groupRef.current.position.copy(newPos);
    }
    groupRef.current.position.y = groundY;
    groupRef.current.lookAt(
      new Vector3(playerPosition.x, groundY, playerPosition.z)
    );
    onUpdatePosition?.(groupRef.current.position);
    if (collision && colliderIdRef.current) {
      collision.updateCollider(colliderIdRef.current, groupRef.current.position);
    }
  });

  return (
    <group
      ref={groupRef}
      position={startPosition.toArray() as [number, number, number]}
      visible={visible}
    >
      <primitive object={scene.clone()} scale={0.2} rotation={[0, Math.PI, 0]} />
      <Html
        position={[0, 1.5, 0]}
        center
        style={{ pointerEvents: 'none' }}
        transform
        distanceFactor={8}
      >
        <div className="w-16">
          <Progress
            value={(health / 5) * 100}
            direction="rtl"
            indicatorClassName={health < 5 ? 'bg-red-600' : 'bg-green-500'}
            className="h-2"
          />
        </div>
      </Html>
    </group>
  );
};

useGLTF.preload(assetPath('assets/leech.glb'));

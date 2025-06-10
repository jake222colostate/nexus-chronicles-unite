import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Mesh } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface MonsterProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
}

export const Monster: React.FC<MonsterProps> = ({
  position = [0, 0, 0],
  playerPosition,
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId
}) => {
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 1.5;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  const { scene: monsterScene } = useGLTF('/assets/monster_rig.glb');

  useEffect(() => {
    if (monsterScene && modelRef.current) {
      modelRef.current.clear();
      const clone = monsterScene.clone();
      clone.traverse(child => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      clone.scale.setScalar(0.5);
      modelRef.current.add(clone);
    }
  }, [monsterScene]);

  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) fadeOutStarted.current = true;
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
      }
      return;
    }

    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);
    currentPosition.current.y = 0;
    groupRef.current.position.copy(currentPosition.current);

    if (modelRef.current) {
      const angle = Math.atan2(direction.x, direction.z);
      modelRef.current.rotation.y = angle;
    }

    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 1.5 && onReachPlayer) {
      onReachPlayer();
    }
  });

  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar enemyHealth={enemyHealth} position={[0, 2, 0]} />
      )}
      <group ref={modelRef} />
      {!monsterScene && (
        <mesh>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#553344" />
        </mesh>
      )}
      <mesh visible={false}>
        <boxGeometry args={[1, 2, 1]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </group>
  );
};

useGLTF.preload('/assets/monster_rig.glb');

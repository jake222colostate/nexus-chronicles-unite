
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface EnemyProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
}

export const Enemy: React.FC<EnemyProps> = ({ 
  position = [0, 0, 0],
  playerPosition, 
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 2;
  const initialized = useRef(false);

  // Initialize enemy health on mount
  useEffect(() => {
    if (!initialized.current && onInitialize) {
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Don't move if dead
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      // Fade out dead enemy
      groupRef.current.scale.setScalar(Math.max(0, groupRef.current.scale.x - delta * 2));
      if (groupRef.current.scale.x <= 0.1) {
        groupRef.current.visible = false;
      }
      return;
    }

    // Calculate direction toward player
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    // Move toward player
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Update group position
    groupRef.current.position.copy(currentPosition.current);

    // Check if enemy reached player (within 2 units)
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead and faded out
  if (enemyHealth && enemyHealth.currentHealth <= 0 && groupRef.current && !groupRef.current.visible) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {/* Health bar - always render if enemy health exists */}
      {enemyHealth && (
        <EnemyHealthBar enemyHealth={enemyHealth} position={[0, 2.5, 0]} />
      )}
      
      {/* Body */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.3, 0.6, 1.5, 8]} />
        <meshStandardMaterial color="#552222" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#dd3344" />
      </mesh>

      {/* Horns */}
      <mesh position={[0.35, 0.9, 0]} rotation={[0, 0, Math.PI / 8]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      <mesh position={[-0.35, 0.9, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
    </group>
  );
};

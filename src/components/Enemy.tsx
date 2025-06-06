
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
  const fadeOutStarted = useRef(false);

  // Initialize enemy health on mount - only once
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`Enemy ${enemyId} initializing health system at position:`, position);
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Handle dead enemy - start fade out and disappear
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`Enemy ${enemyId} starting fade out - health: ${enemyHealth.currentHealth}`);
      }
      
      // Fade out dead enemy quickly
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3); // Faster fade out
      groupRef.current.scale.setScalar(newScale);
      
      // Make enemy completely invisible when scale is very small
      if (newScale <= 0.1) {
        groupRef.current.visible = false;
        console.log(`Enemy ${enemyId} completely faded out and hidden`);
      }
      return;
    }

    // Reset fade out if enemy is alive again (shouldn't happen but safety check)
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
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

  // Don't render if dead and faded out or not visible
  if (enemyHealth && enemyHealth.currentHealth <= 0 && groupRef.current && !groupRef.current.visible) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {/* Health bar - only render if enemy health exists and is alive */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2.5, 0]} 
        />
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

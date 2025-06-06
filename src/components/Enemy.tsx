
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface EnemyProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
}

export const Enemy: React.FC<EnemyProps> = ({ 
  position = [0, 0, 0], // Default position to prevent undefined errors
  playerPosition, 
  onReachPlayer 
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 2; // units per second

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

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

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
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

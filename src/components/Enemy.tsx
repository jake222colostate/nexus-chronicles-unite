
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

interface EnemyProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
}

export const Enemy: React.FC<EnemyProps> = ({ 
  position, 
  playerPosition, 
  onReachPlayer 
}) => {
  const meshRef = useRef<Mesh>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 2; // units per second

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Calculate direction toward player
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    // Move toward player
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Update mesh position
    meshRef.current.position.copy(currentPosition.current);

    // Check if enemy reached player (within 2 units)
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2 && onReachPlayer) {
      onReachPlayer();
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      castShadow
      receiveShadow
    >
      {/* Tall rectangular enemy */}
      <boxGeometry args={[1, 4, 0.5]} />
      <meshStandardMaterial 
        color="#8B0000" 
        emissive="#330000"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

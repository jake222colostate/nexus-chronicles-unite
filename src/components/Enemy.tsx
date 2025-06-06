
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface EnemyProps {
  data: import('./EnemySystem').EnemyData;
  playerPosition: Vector3;
  onReachPlayer?: () => void;
}

export const Enemy: React.FC<EnemyProps> = ({
  data,
  playerPosition,
  onReachPlayer
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...data.position));
  const speed = 2; // units per second

  useFrame((_, delta) => {
    if (!groupRef.current) return;

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

  const healthRatio = data.health / data.maxHealth;

  return (
    <group ref={groupRef} position={data.position} castShadow receiveShadow>
      {/* Enemy model based on type */}
      {data.type === 'demon' ? (
        <>
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.3, 0.6, 1.5, 8]} />
            <meshStandardMaterial color="#552222" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#dd3344" />
          </mesh>
          <mesh position={[0.35, 0.9, 0]} rotation={[0, 0, Math.PI / 8]}>
            <coneGeometry args={[0.2, 0.5, 8]} />
            <meshStandardMaterial color="#ffd700" />
          </mesh>
          <mesh position={[-0.35, 0.9, 0]} rotation={[0, 0, -Math.PI / 8]}>
            <coneGeometry args={[0.2, 0.5, 8]} />
            <meshStandardMaterial color="#ffd700" />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[0.8, 1.6, 0.6]} />
            <meshStandardMaterial color="green" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial color="#88aa66" />
          </mesh>
        </>
      )}

      {/* Health bar background (full width) */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.2, 0.15, 0.05]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      
      {/* Health bar fill - depletes from left to right */}
      <mesh position={[-0.6 * (1 - healthRatio), 1.8, 0.03]}>
        <boxGeometry args={[1.2 * healthRatio, 0.12, 0.03]} />
        <meshBasicMaterial color={healthRatio > 0.5 ? "#00ff00" : healthRatio > 0.25 ? "#ffff00" : "#ff0000"} />
      </mesh>
    </group>
  );
};

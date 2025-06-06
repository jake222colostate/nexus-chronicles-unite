
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useEnemyDamageSystem } from '../hooks/useEnemyDamageSystem';

interface EnemyProps {
  data: import('./EnemySystem').EnemyData;
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  onEnemyDamage?: (enemyId: string, damage: number) => { killed: boolean; reward: number } | null;
}

export const Enemy: React.FC<EnemyProps> = ({
  data,
  playerPosition,
  onReachPlayer,
  onEnemyDamage
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...data.position));
  const { getEnemyHealth, initializeEnemy } = useEnemyDamageSystem();
  const speed = 2;

  // Initialize enemy health when component mounts
  useEffect(() => {
    initializeEnemy(data.id, playerPosition.z);
  }, [data.id, playerPosition.z, initializeEnemy]);

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

  // Get current health data
  const healthData = getEnemyHealth(data.id);
  const healthRatio = healthData ? healthData.currentHealth / healthData.maxHealth : data.health / data.maxHealth;
  const isHitFlashing = healthData?.hitFlash || false;

  return (
    <group ref={groupRef} position={data.position} castShadow receiveShadow>
      {/* Enemy model based on type */}
      {data.type === 'demon' ? (
        <>
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.3, 0.6, 1.5, 8]} />
            <meshStandardMaterial 
              color={isHitFlashing ? "#ff8888" : "#552222"} 
              emissive={isHitFlashing ? "#ff0000" : "#000000"}
              emissiveIntensity={isHitFlashing ? 0.3 : 0}
            />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial 
              color={isHitFlashing ? "#ff6666" : "#dd3344"}
              emissive={isHitFlashing ? "#ff0000" : "#000000"}
              emissiveIntensity={isHitFlashing ? 0.3 : 0}
            />
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
            <meshStandardMaterial 
              color={isHitFlashing ? "#aaffaa" : "green"}
              emissive={isHitFlashing ? "#00ff00" : "#000000"}
              emissiveIntensity={isHitFlashing ? 0.3 : 0}
            />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial 
              color={isHitFlashing ? "#bbffbb" : "#88aa66"}
              emissive={isHitFlashing ? "#00ff00" : "#000000"}
              emissiveIntensity={isHitFlashing ? 0.3 : 0}
            />
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

      {/* Floating damage text would go here if implemented */}
    </group>
  );
};

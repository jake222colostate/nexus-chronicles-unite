
import React, { useMemo } from 'react';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface EnemyHealthBarProps {
  enemyHealth: EnemyHealth;
  position?: [number, number, number];
}

export const EnemyHealthBar: React.FC<EnemyHealthBarProps> = ({ 
  enemyHealth, 
  position = [0, 2.5, 0] 
}) => {
  const healthPercentage = useMemo(() => {
    return Math.max(0, Math.min(1, enemyHealth.currentHealth / enemyHealth.maxHealth));
  }, [enemyHealth.currentHealth, enemyHealth.maxHealth]);

  // Flash effect when recently hit
  const isRecentlyHit = useMemo(() => {
    return Date.now() - enemyHealth.lastHitTime < 200;
  }, [enemyHealth.lastHitTime]);

  // Don't render if enemy is dead
  if (enemyHealth.currentHealth <= 0) {
    return null;
  }

  return (
    <group position={position}>
      {/* Health bar background */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.2, 0.15]} />
        <meshBasicMaterial 
          color="#220000" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Health bar foreground with proper positioning */}
      <mesh 
        position={[(-0.6 + (0.6 * healthPercentage)), 0, 0.02]} 
        scale={[healthPercentage, 1, 1]}
      >
        <planeGeometry args={[1.2, 0.12]} />
        <meshBasicMaterial 
          color={isRecentlyHit ? "#FFFFFF" : "#FF3333"} 
          transparent 
          opacity={isRecentlyHit ? 1.0 : 0.9}
        />
      </mesh>
      
      {/* Health bar border */}
      <mesh position={[0, 0, 0.03]}>
        <ringGeometry args={[0.5, 0.62, 16]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

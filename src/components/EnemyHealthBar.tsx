
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
    return Math.max(0, enemyHealth.currentHealth / enemyHealth.maxHealth);
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
      {/* Background bar (dark red) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.2, 0.15]} />
        <meshBasicMaterial 
          color="#330000" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Health bar (bright red) */}
      <mesh 
        position={[-0.6 + (0.6 * healthPercentage), 0, 0.02]} 
        scale={[healthPercentage, 1, 1]}
      >
        <planeGeometry args={[1.2, 0.12]} />
        <meshBasicMaterial 
          color={isRecentlyHit ? "#FFFFFF" : "#FF0000"} 
          transparent 
          opacity={isRecentlyHit ? 1.0 : 0.9}
        />
      </mesh>
      
      {/* Border */}
      <mesh position={[0, 0, 0.03]}>
        <ringGeometry args={[0.6, 0.65, 8]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

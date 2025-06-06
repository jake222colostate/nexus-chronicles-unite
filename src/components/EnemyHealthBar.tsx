
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
      {/* Background bar (dark red) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.0, 0.12]} />
        <meshBasicMaterial 
          color="#220000" 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Health bar (bright red) with proper scaling */}
      <mesh 
        position={[-0.5 + (0.5 * healthPercentage), 0, 0.02]} 
        scale={[healthPercentage, 1, 1]}
      >
        <planeGeometry args={[1.0, 0.1]} />
        <meshBasicMaterial 
          color={isRecentlyHit ? "#FFFFFF" : "#FF2222"} 
          transparent 
          opacity={isRecentlyHit ? 1.0 : 0.95}
        />
      </mesh>
      
      {/* Border outline */}
      <mesh position={[0, 0, 0.03]}>
        <ringGeometry args={[0.45, 0.52, 8]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

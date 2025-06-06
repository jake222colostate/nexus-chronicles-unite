
import React, { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { EnemyData } from './EnemySystem';

interface AutomaticWeaponSystemProps {
  enemies: EnemyData[];
  combatStats: {
    damage: number;
    fireRate: number;
    autoAimRange: number;
  };
  onEnemyHit: (enemyId: string, damage: number) => void;
}

export const AutomaticWeaponSystem: React.FC<AutomaticWeaponSystemProps> = ({
  enemies,
  combatStats,
  onEnemyHit
}) => {
  const { camera } = useThree();
  const lastShot = useRef(0);

  const findNearestEnemy = useCallback(() => {
    return enemies
      .filter(enemy => {
        const distance = new Vector3(...enemy.position).distanceTo(camera.position);
        return distance <= combatStats.autoAimRange;
      })
      .sort((a, b) => {
        const distanceA = new Vector3(...a.position).distanceTo(camera.position);
        const distanceB = new Vector3(...b.position).distanceTo(camera.position);
        return distanceA - distanceB;
      })[0];
  }, [enemies, camera, combatStats.autoAimRange]);

  useFrame(() => {
    const now = performance.now();
    // Much faster automatic shooting
    const fireInterval = Math.max(100, combatStats.fireRate * 0.2); // Reduced fire interval significantly
    
    if (now - lastShot.current > fireInterval) {
      const target = findNearestEnemy();
      
      if (target) {
        // Instant hit for automatic weapon
        onEnemyHit(target.id, combatStats.damage);
        lastShot.current = now;
      }
    }
  });

  return null; // This weapon system doesn't render visible projectiles
};

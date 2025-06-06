import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { EnemyData } from './EnemySystem';

interface Projectile {
  id: string;
  position: Vector3;
  direction: Vector3;
  damage: number;
  speed: number;
  age: number;
}

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
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastShot = useRef(0);

  // Calculate weapon stats with upgrades
  const weaponStats = useMemo(() => ({
    damage: Math.max(1, combatStats.damage),
    fireRate: Math.max(200, combatStats.fireRate), // milliseconds between shots
    range: Math.max(15, combatStats.autoAimRange || 15),
    projectileSpeed: 25
  }), [combatStats]);

  const shoot = useCallback((target: Vector3) => {
    const origin = camera.position.clone();
    const direction = new Vector3().subVectors(target, origin).normalize();
    
    setProjectiles(prev => [
      ...prev,
      {
        id: `proj_${Date.now()}_${Math.random()}`,
        position: origin.clone(),
        direction,
        damage: weaponStats.damage,
        speed: weaponStats.projectileSpeed,
        age: 0
      }
    ]);
  }, [camera, weaponStats.damage, weaponStats.projectileSpeed]);

  useFrame((_, delta) => {
    const now = performance.now();
    
    // Auto-targeting and shooting
    if (now - lastShot.current > weaponStats.fireRate) {
      // Find closest enemy within range
      const enemiesInRange = enemies.filter(enemy => {
        const enemyPos = new Vector3(...enemy.position);
        const distance = enemyPos.distanceTo(camera.position);
        return distance <= weaponStats.range && distance > 1; // Don't shoot if too close
      });

      if (enemiesInRange.length > 0) {
        // Sort by distance and target the closest
        const target = enemiesInRange.sort((a, b) => {
          const distA = new Vector3(...a.position).distanceTo(camera.position);
          const distB = new Vector3(...b.position).distanceTo(camera.position);
          return distA - distB;
        })[0];

        const targetPosition = new Vector3(...target.position);
        shoot(targetPosition);
        lastShot.current = now;
      }
    }

    // Update projectiles
    setProjectiles(prev => {
      const updated: Projectile[] = [];
      
      for (const projectile of prev) {
        // Move projectile
        const newPos = projectile.position.clone().add(
          projectile.direction.clone().multiplyScalar(projectile.speed * delta)
        );
        const newAge = projectile.age + delta;
        
        // Check for enemy hits
        let hit = false;
        for (const enemy of enemies) {
          const enemyPos = new Vector3(...enemy.position);
          if (newPos.distanceTo(enemyPos) < 1.2) { // Hit detection radius
            onEnemyHit(enemy.id, projectile.damage);
            hit = true;
            break;
          }
        }
        
        // Keep projectile if not hit and still in range/time
        if (!hit && newAge < 5 && camera.position.distanceTo(newPos) < weaponStats.range * 2) {
          updated.push({
            ...projectile,
            position: newPos,
            age: newAge
          });
        }
      }
      
      return updated;
    });
  });

  return (
    <group>
      {projectiles.map(projectile => (
        <mesh
          key={projectile.id}
          position={projectile.position.toArray() as [number, number, number]}
          castShadow
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

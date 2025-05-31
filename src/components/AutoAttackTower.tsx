
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Enemy3D } from './3DEnemySystem';

interface Projectile {
  id: string;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  targetId: string;
  speed: number;
  damage: number;
}

interface AutoAttackTowerProps {
  enemies: Enemy3D[];
  damage: number;
  fireRate: number; // in milliseconds
  range: number;
  onProjectileHit: (targetId: string, damage: number) => void;
  onMuzzleFlash: () => void;
}

export const AutoAttackTower: React.FC<AutoAttackTowerProps> = ({
  enemies,
  damage,
  fireRate,
  range,
  onProjectileHit,
  onMuzzleFlash
}) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastFireTimeRef = useRef(0);

  // Find nearest enemy in range
  const findTarget = useCallback((): Enemy3D | null => {
    if (enemies.length === 0) return null;
    
    let nearest = null;
    let nearestDistance = Infinity;
    
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.x, 2) + 
        Math.pow(enemy.y, 2) + 
        Math.pow(enemy.z, 2)
      );
      
      if (distance <= range && distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });
    
    return nearest;
  }, [enemies, range]);

  // Auto-fire at enemies
  useEffect(() => {
    const now = Date.now();
    if (now - lastFireTimeRef.current > fireRate) {
      const target = findTarget();
      if (target) {
        const newProjectile: Projectile = {
          id: `projectile_${now}_${Math.random()}`,
          x: 0,
          y: 2,
          z: 0,
          targetX: target.x,
          targetY: target.y + 0.5,
          targetZ: target.z,
          targetId: target.id,
          speed: 0.8,
          damage
        };
        
        setProjectiles(prev => [...prev, newProjectile]);
        lastFireTimeRef.current = now;
        onMuzzleFlash();
      }
    }
  }, [enemies, damage, fireRate, range, findTarget, onMuzzleFlash]);

  // Move projectiles and check hits
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setProjectiles(prev => {
        return prev.map(projectile => {
          const dx = projectile.targetX - projectile.x;
          const dy = projectile.targetY - projectile.y;
          const dz = projectile.targetZ - projectile.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance < 0.5) {
            // Hit target
            onProjectileHit(projectile.targetId, projectile.damage);
            return null;
          }
          
          // Move towards target
          const moveX = (dx / distance) * projectile.speed;
          const moveY = (dy / distance) * projectile.speed;
          const moveZ = (dz / distance) * projectile.speed;
          
          return {
            ...projectile,
            x: projectile.x + moveX,
            y: projectile.y + moveY,
            z: projectile.z + moveZ
          };
        }).filter(Boolean) as Projectile[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [onProjectileHit]);

  return (
    <>
      {/* Tower Model */}
      <group position={[0, 0, -2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1.2, 2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 1.2]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        {/* Cannon */}
        <mesh position={[0, 1.8, 0.6]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 0.8]} />
          <meshLambertMaterial color="#2F4F4F" />
        </mesh>
      </group>

      {/* Projectiles */}
      {projectiles.map(projectile => (
        <group key={projectile.id} position={[projectile.x, projectile.y, projectile.z]}>
          <mesh>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          {/* Projectile trail */}
          <mesh>
            <sphereGeometry args={[0.15]} />
            <meshBasicMaterial color="#FFA500" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </>
  );
};


import React, { useState, useEffect, useCallback } from 'react';
import { Enemy } from './EnemySystem';

interface Projectile {
  id: string;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  speed: number;
  damage: number;
}

interface ProjectileSystemProps {
  enemies: Enemy[];
  combatUpgrades: any;
  onProjectileHit: (projectileId: string, enemyId: string) => void;
  onMuzzleFlash: () => void;
}

export const ProjectileSystem: React.FC<ProjectileSystemProps> = ({
  enemies,
  combatUpgrades,
  onProjectileHit,
  onMuzzleFlash
}) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [lastFireTime, setLastFireTime] = useState(0);

  // Get nearest enemy
  const getNearestEnemy = useCallback((): Enemy | null => {
    if (enemies.length === 0) return null;
    
    let nearest = enemies[0];
    let nearestDistance = Math.sqrt(
      Math.pow(nearest.x, 2) + 
      Math.pow(nearest.y - 5, 2) + 
      Math.pow(nearest.z, 2)
    );
    
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.x, 2) + 
        Math.pow(enemy.y - 5, 2) + 
        Math.pow(enemy.z, 2)
      );
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });
    
    return nearest;
  }, [enemies]);

  // Fire projectiles
  useEffect(() => {
    const fireRate = combatUpgrades.fireRate || 1000; // Default 1 second
    const now = Date.now();
    
    if (now - lastFireTime > fireRate && enemies.length > 0) {
      const target = getNearestEnemy();
      if (target) {
        const newProjectile: Projectile = {
          id: `projectile_${now}_${Math.random()}`,
          x: 0,
          y: 5,
          z: 0,
          targetX: target.x,
          targetY: target.y,
          targetZ: target.z,
          speed: 2,
          damage: combatUpgrades.damage || 1
        };
        
        setProjectiles(prev => [...prev, newProjectile]);
        setLastFireTime(now);
        onMuzzleFlash();
      }
    }
  }, [enemies, combatUpgrades, lastFireTime, getNearestEnemy, onMuzzleFlash]);

  // Move projectiles
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setProjectiles(prev => {
        return prev.map(projectile => {
          // Calculate direction to target
          const dx = projectile.targetX - projectile.x;
          const dy = projectile.targetY - projectile.y;
          const dz = projectile.targetZ - projectile.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance < 1) {
            // Projectile reached target, check for hits
            enemies.forEach(enemy => {
              const enemyDistance = Math.sqrt(
                Math.pow(enemy.x - projectile.x, 2) +
                Math.pow(enemy.y - projectile.y, 2) +
                Math.pow(enemy.z - projectile.z, 2)
              );
              if (enemyDistance < 2) {
                onProjectileHit(projectile.id, enemy.id);
              }
            });
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
  }, [enemies, onProjectileHit]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {projectiles.map(projectile => {
        // Convert 3D position to 2D screen position
        const screenX = (projectile.x / 30) * 50 + 50;
        const screenY = 100 - ((projectile.z / 70) * 100);
        const scale = Math.max(0.5, Math.min(1.2, (70 - projectile.z) / 70));
        
        return (
          <div
            key={projectile.id}
            className="absolute"
            style={{
              left: `${screenX}%`,
              top: `${screenY}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: Math.floor(projectile.z) + 100
            }}
          >
            <div className="text-2xl animate-spin">💫</div>
            {/* Projectile trail */}
            <div className="absolute inset-0 bg-purple-400/30 rounded-full animate-pulse" 
                 style={{ width: '20px', height: '20px', transform: 'translate(-50%, -50%)' }} />
          </div>
        );
      })}
    </div>
  );
};

export { type Projectile };

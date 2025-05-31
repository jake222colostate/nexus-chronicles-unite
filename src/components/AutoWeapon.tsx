
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GroundEnemy } from './GroundEnemySystem';

interface Projectile {
  id: string;
  x: number;
  y: number;
  z: number;
  targetId: string;
  speed: number;
  damage: number;
}

interface AutoWeaponProps {
  enemies: GroundEnemy[];
  combatStats: {
    damage: number;
    fireRate: number;
    range: number;
  };
  onEnemyHit: (enemyId: string, damage: number) => void;
  onMuzzleFlash: () => void;
}

export const AutoWeapon: React.FC<AutoWeaponProps> = ({
  enemies,
  combatStats,
  onEnemyHit,
  onMuzzleFlash
}) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastFireTime = useRef(0);

  // Auto-fire at nearest enemy
  useEffect(() => {
    const fireInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastFireTime.current >= combatStats.fireRate) {
        const nearestEnemy = enemies
          .filter(enemy => {
            const distance = Math.sqrt(enemy.x * enemy.x + enemy.z * enemy.z);
            return distance <= combatStats.range;
          })
          .sort((a, b) => {
            const distA = Math.sqrt(a.x * a.x + a.z * a.z);
            const distB = Math.sqrt(b.x * b.x + b.z * b.z);
            return distA - distB;
          })[0];

        if (nearestEnemy) {
          const newProjectile: Projectile = {
            id: `proj_${Date.now()}_${Math.random()}`,
            x: 0,
            y: 1.5,
            z: 0,
            targetId: nearestEnemy.id,
            speed: 0.5,
            damage: combatStats.damage
          };

          setProjectiles(prev => [...prev, newProjectile]);
          onMuzzleFlash();
          lastFireTime.current = now;
        }
      }
    }, 100);

    return () => clearInterval(fireInterval);
  }, [enemies, combatStats, onMuzzleFlash]);

  // Move projectiles
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setProjectiles(prev => {
        return prev.map(projectile => {
          const target = enemies.find(e => e.id === projectile.targetId);
          if (!target) return null;

          const dx = target.x - projectile.x;
          const dy = target.y - projectile.y;
          const dz = target.z - projectile.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 1) {
            // Hit target
            onEnemyHit(target.id, projectile.damage);
            return null;
          }

          // Move towards target
          const newX = projectile.x + (dx / distance) * projectile.speed;
          const newY = projectile.y + (dy / distance) * projectile.speed;
          const newZ = projectile.z + (dz / distance) * projectile.speed;

          return {
            ...projectile,
            x: newX,
            y: newY,
            z: newZ
          };
        }).filter(Boolean) as Projectile[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [enemies, onEnemyHit]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Weapon Visual - positioned at player location */}
      <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 z-30">
        <div className="text-2xl animate-pulse">🏹</div>
      </div>

      {/* Projectiles */}
      {projectiles.map(projectile => {
        const screenX = 50 + (projectile.x / 15) * 25;
        const screenY = 70 - ((projectile.z / 40) * 30);
        const scale = Math.max(0.5, Math.min(1.2, (40 - projectile.z) / 40));

        return (
          <div
            key={projectile.id}
            className="absolute transition-all duration-100"
            style={{
              left: `${screenX}%`,
              top: `${screenY}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: Math.floor(50 - projectile.z)
            }}
          >
            <div className="text-lg text-yellow-400 drop-shadow-lg animate-pulse">✨</div>
          </div>
        );
      })}
    </div>
  );
};

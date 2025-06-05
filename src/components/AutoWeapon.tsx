
import React, { useState, useEffect, useRef, useCallback } from 'react';

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
  enemies: any[];
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

  // Auto-fire every 1.5 seconds at nearest enemy
  useEffect(() => {
    const fireInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastFireTime.current >= 1500) { // 1.5 second intervals
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
            speed: 0.8,
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

  // Move projectiles and handle hits
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

          if (distance < 1.5) {
            // Hit target and give +1 mana reward
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
        <div className="text-3xl animate-pulse">⚔️</div>
      </div>

      {/* Projectiles with enhanced visual effects */}
      {projectiles.map(projectile => {
        const screenX = 50 + (projectile.x / 15) * 25;
        const screenY = 70 - ((projectile.z / 40) * 30);
        const scale = Math.max(0.6, Math.min(1.4, (40 - projectile.z) / 40));

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
            <div
              className="w-4 h-4 rounded-full shadow-md"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, #fff89e, #facc15 60%, #b45309)',
                border: '1px solid rgba(250, 204, 21, 0.8)'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

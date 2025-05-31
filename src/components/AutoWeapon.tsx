import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { GroundEnemy } from './GroundEnemy3DSystem';

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

const Projectile3D: React.FC<{ projectile: Projectile }> = ({ projectile }) => {
  return (
    <mesh position={[projectile.x, projectile.y, projectile.z]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshBasicMaterial color="#fbbf24" />
      <pointLight 
        color="#fbbf24" 
        intensity={0.5} 
        distance={2} 
      />
    </mesh>
  );
};

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

      {/* 3D Projectiles Canvas */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ 
          position: [0, 8, 8], 
          fov: 60,
          near: 0.1,
          far: 100
        }}
        gl={{ antialias: false, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.4} />
        
        {/* 3D Projectiles */}
        {projectiles.map(projectile => (
          <Projectile3D
            key={projectile.id}
            projectile={projectile}
          />
        ))}
      </Canvas>
    </div>
  );
};

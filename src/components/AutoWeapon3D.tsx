
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { WizardStaff3D } from './WizardStaff3D';
import { MODEL_PATHS } from './ModelLoader3D';
import { GroundEnemy } from './GroundEnemySystem3D';

interface Projectile3D {
  id: string;
  x: number;
  y: number;
  z: number;
  targetId: string;
  speed: number;
  damage: number;
}

interface AutoWeapon3DProps {
  enemies: GroundEnemy[];
  combatStats: {
    damage: number;
    fireRate: number;
    range: number;
  };
  onEnemyHit: (enemyId: string, damage: number) => void;
  onMuzzleFlash: () => void;
}

const Projectile3DComponent: React.FC<{ projectile: Projectile3D }> = ({ projectile }) => {
  return (
    <group position={[projectile.x, projectile.y, projectile.z]}>
      <mesh>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.9} />
      </mesh>
      
      {/* Projectile trail */}
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export const AutoWeapon3D: React.FC<AutoWeapon3DProps> = ({
  enemies,
  combatStats,
  onEnemyHit,
  onMuzzleFlash
}) => {
  const [projectiles, setProjectiles] = useState<Projectile3D[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
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
          const newProjectile: Projectile3D = {
            id: `proj_${Date.now()}_${Math.random()}`,
            x: 0,
            y: 1.5,
            z: 0,
            targetId: nearestEnemy.id,
            speed: 0.5,
            damage: combatStats.damage
          };

          setProjectiles(prev => [...prev, newProjectile]);
          setIsAttacking(true);
          onMuzzleFlash();
          lastFireTime.current = now;
          
          // Stop attack animation after a short time
          setTimeout(() => setIsAttacking(false), 200);
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
        }).filter(Boolean) as Projectile3D[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [enemies, onEnemyHit]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* First-person weapon view */}
      <Canvas
        className="pointer-events-none"
        camera={{ position: [0, 0, 0], fov: 60 }}
        style={{ zIndex: 100 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        
        <WizardStaff3D
          modelPath={MODEL_PATHS.weapons.wizardStaff}
          isAttacking={isAttacking}
          onMuzzleFlash={onMuzzleFlash}
        />
      </Canvas>

      {/* Projectiles in world space */}
      <Canvas
        className="pointer-events-none absolute inset-0"
        camera={{ position: [0, 2, 8], fov: 60 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        
        {projectiles.map(projectile => (
          <Projectile3DComponent
            key={projectile.id}
            projectile={projectile}
          />
        ))}
      </Canvas>
    </div>
  );
};

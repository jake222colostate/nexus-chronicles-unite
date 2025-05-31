
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
  targetX: number;
  targetY: number;
  targetZ: number;
  speed: number;
  damage: number;
  lifeTime: number;
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
      {/* Main projectile orb */}
      <mesh>
        <sphereGeometry args={[0.12]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.9} />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      
      {/* Outer particle effect */}
      <mesh>
        <sphereGeometry args={[0.18]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
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

  // Get nearest enemy within range
  const getNearestEnemy = useCallback((): GroundEnemy | null => {
    if (enemies.length === 0) return null;
    
    const enemiesInRange = enemies.filter(enemy => {
      const distance = Math.sqrt(enemy.x * enemy.x + enemy.z * enemy.z);
      return distance <= combatStats.range;
    });
    
    if (enemiesInRange.length === 0) return null;
    
    // Sort by closest
    enemiesInRange.sort((a, b) => {
      const distA = Math.sqrt(a.x * a.x + a.z * a.z);
      const distB = Math.sqrt(b.x * b.x + b.z * b.z);
      return distA - distB;
    });
    
    return enemiesInRange[0];
  }, [enemies, combatStats.range]);

  // Auto-fire at nearest enemy
  useEffect(() => {
    const fireInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastFireTime.current >= combatStats.fireRate) {
        const target = getNearestEnemy();
        if (target) {
          const newProjectile: Projectile3D = {
            id: `proj_${Date.now()}_${Math.random()}`,
            x: 1.2, // Start from staff position
            y: 1.5,
            z: -1,
            targetId: target.id,
            targetX: target.x,
            targetY: target.y + 1, // Aim for center of enemy
            targetZ: target.z,
            speed: 0.8,
            damage: combatStats.damage,
            lifeTime: 0
          };

          console.log(`Firing projectile at enemy ${target.id} at position (${target.x.toFixed(1)}, ${target.y.toFixed(1)}, ${target.z.toFixed(1)})`);

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
  }, [enemies, combatStats, onMuzzleFlash, getNearestEnemy]);

  // Move projectiles and handle collisions
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setProjectiles(prev => {
        return prev.map(projectile => {
          const target = enemies.find(e => e.id === projectile.targetId);
          
          // Update projectile lifetime
          const newLifeTime = projectile.lifeTime + 0.05;
          
          // Remove projectile if too old or no target
          if (newLifeTime > 5 || !target) {
            return null;
          }

          // Calculate direction to target (use stored target position for consistency)
          const dx = projectile.targetX - projectile.x;
          const dy = projectile.targetY - projectile.y;
          const dz = projectile.targetZ - projectile.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Check for hit
          if (distance < 1.5) {
            console.log(`Projectile ${projectile.id} hit enemy ${projectile.targetId}!`);
            onEnemyHit(projectile.targetId, projectile.damage);
            return null;
          }

          // Move towards target
          const normalizedX = dx / distance;
          const normalizedY = dy / distance;
          const normalizedZ = dz / distance;
          
          const newX = projectile.x + normalizedX * projectile.speed;
          const newY = projectile.y + normalizedY * projectile.speed;
          const newZ = projectile.z + normalizedZ * projectile.speed;

          return {
            ...projectile,
            x: newX,
            y: newY,
            z: newZ,
            lifeTime: newLifeTime
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

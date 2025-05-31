
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
  startTime: number;
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
  const projectileRef = useRef<any>(null);

  React.useEffect(() => {
    if (projectileRef.current) {
      const elapsed = Date.now() - projectile.startTime;
      const pulseIntensity = 1 + Math.sin(elapsed * 0.01) * 0.3;
      projectileRef.current.scale.setScalar(pulseIntensity);
    }
  });

  return (
    <group position={[projectile.x, projectile.y, projectile.z]}>
      <mesh ref={projectileRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#f59e0b"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Trail effect */}
      <mesh position={[0, 0, -0.3]} scale={[0.8, 0.8, 1.5]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshBasicMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.4}
        />
      </mesh>
      
      {/* Energy glow */}
      <pointLight 
        color="#fbbf24" 
        intensity={1.5} 
        distance={3} 
      />
    </group>
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

  // Auto-fire at nearest enemy within range
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
            y: 2,
            z: 0,
            targetId: nearestEnemy.id,
            speed: 0.8,
            damage: combatStats.damage,
            startTime: now
          };

          setProjectiles(prev => [...prev, newProjectile]);
          onMuzzleFlash();
          lastFireTime.current = now;
        }
      }
    }, 100);

    return () => clearInterval(fireInterval);
  }, [enemies, combatStats, onMuzzleFlash]);

  // Move projectiles towards targets
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

          // Check for hit
          if (distance < 1.2) {
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

  // Clean up old projectiles
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setProjectiles(prev => {
        const now = Date.now();
        return prev.filter(projectile => now - projectile.startTime < 5000);
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Enhanced Weapon Visual */}
      <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 z-30">
        <div className="relative">
          <div className="text-3xl animate-pulse">🏹</div>
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
        </div>
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
        <directionalLight position={[5, 10, 5]} intensity={0.5} />
        
        {/* Enhanced 3D Projectiles */}
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

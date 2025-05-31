
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Enemy3D } from './Enemy3DSystem';

interface Projectile3D {
  id: string;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  speed: number;
  damage: number;
  type: 'arrow' | 'fireball' | 'laser';
}

interface Projectile3DSystemProps {
  enemies: Enemy3D[];
  combatStats: {
    damage: number;
    fireRate: number;
    range: number;
  };
  onEnemyHit: (enemyId: string, damage: number) => void;
  onMuzzleFlash: () => void;
  realm: 'fantasy' | 'scifi';
}

// 3D Projectile Model Component
const Projectile3DModel: React.FC<{
  projectile: Projectile3D;
  realm: 'fantasy' | 'scifi';
}> = ({ projectile, realm }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Update position
      meshRef.current.position.set(projectile.x, projectile.y, projectile.z);
      
      // Calculate rotation to face target
      const direction = new Vector3(
        projectile.targetX - projectile.x,
        projectile.targetY - projectile.y,
        projectile.targetZ - projectile.z
      ).normalize();
      
      meshRef.current.lookAt(
        meshRef.current.position.x + direction.x,
        meshRef.current.position.y + direction.y,
        meshRef.current.position.z + direction.z
      );
      
      // Add spinning effect for some projectile types
      if (projectile.type === 'fireball') {
        meshRef.current.rotation.z += 0.2;
      }
    }
  });

  // Different projectile geometries based on type and realm
  const getProjectileGeometry = () => {
    switch (projectile.type) {
      case 'arrow':
        return (
          <group ref={meshRef}>
            <mesh>
              <coneGeometry args={[0.05, 0.8]} />
              <meshLambertMaterial color={realm === 'fantasy' ? '#8B4513' : '#00FFFF'} />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4]} />
              <meshLambertMaterial color={realm === 'fantasy' ? '#654321' : '#888888'} />
            </mesh>
          </group>
        );
      
      case 'fireball':
        return (
          <group ref={meshRef}>
            <mesh>
              <sphereGeometry args={[0.15]} />
              <meshBasicMaterial color="#FF4500" />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.2]} />
              <meshBasicMaterial color="#FF6347" transparent opacity={0.6} />
            </mesh>
            {/* Particle trail effect */}
            <mesh position={[0, 0, -0.3]}>
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial color="#FFA500" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      
      case 'laser':
        return (
          <group ref={meshRef}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 1]} />
              <meshBasicMaterial color="#00FFFF" />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 1]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
            </mesh>
          </group>
        );
      
      default:
        return (
          <mesh ref={meshRef}>
            <sphereGeometry args={[0.1]} />
            <meshLambertMaterial color="#FFFF00" />
          </mesh>
        );
    }
  };

  return getProjectileGeometry();
};

export const Projectile3DSystem: React.FC<Projectile3DSystemProps> = ({
  enemies,
  combatStats,
  onEnemyHit,
  onMuzzleFlash,
  realm
}) => {
  const [projectiles, setProjectiles] = useState<Projectile3D[]>([]);
  const lastFireTime = useRef(0);

  // Auto-fire at nearest enemy
  useEffect(() => {
    const fireInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastFireTime.current >= combatStats.fireRate) {
        const nearestEnemy = enemies
          .filter(enemy => !enemy.isDying && !enemy.isSpawning)
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
          const projectileType = realm === 'fantasy' 
            ? (Math.random() > 0.5 ? 'arrow' : 'fireball')
            : 'laser';
          
          const newProjectile: Projectile3D = {
            id: `proj3d_${Date.now()}_${Math.random()}`,
            x: 0,
            y: 1.5,
            z: 0,
            targetX: nearestEnemy.x,
            targetY: nearestEnemy.y + 1,
            targetZ: nearestEnemy.z,
            speed: 0.8,
            damage: combatStats.damage,
            type: projectileType
          };

          setProjectiles(prev => [...prev, newProjectile]);
          onMuzzleFlash();
          lastFireTime.current = now;
        }
      }
    }, 100);

    return () => clearInterval(fireInterval);
  }, [enemies, combatStats, onMuzzleFlash, realm]);

  // Move projectiles and handle collisions
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setProjectiles(prev => {
        return prev.map(projectile => {
          // Calculate direction to target
          const dx = projectile.targetX - projectile.x;
          const dy = projectile.targetY - projectile.y;
          const dz = projectile.targetZ - projectile.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 0.5) {
            // Check for enemy hits
            enemies.forEach(enemy => {
              if (!enemy.isDying && !enemy.isSpawning) {
                const enemyDistance = Math.sqrt(
                  Math.pow(enemy.x - projectile.x, 2) +
                  Math.pow((enemy.y + 1) - projectile.y, 2) +
                  Math.pow(enemy.z - projectile.z, 2)
                );
                if (enemyDistance < 1.5) {
                  onEnemyHit(enemy.id, projectile.damage);
                }
              }
            });
            return null; // Remove projectile
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
        }).filter(Boolean) as Projectile3D[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [enemies, onEnemyHit]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Lighting for projectiles */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />

        {/* Render all 3D projectiles */}
        {projectiles.map(projectile => (
          <Projectile3DModel
            key={projectile.id}
            projectile={projectile}
            realm={realm}
          />
        ))}
      </Canvas>
    </div>
  );
};

export { type Projectile3D };

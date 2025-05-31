
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Enemy3D } from './Enemy3D';
import { Projectile3DSystem } from './Projectile3DSystem';

interface Enemy3D {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  type: 'goblin' | 'orc' | 'dragon';
  speed: number;
  animationState: 'spawn' | 'walk' | 'death';
}

interface Projectile3D {
  id: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  speed: number;
  damage: number;
}

interface Enemy3DSystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: Enemy3D) => void;
  onEnemyDestroyed: (enemy: Enemy3D) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance?: number;
  onEnemiesUpdate?: (enemies: Enemy3D[]) => void;
  weaponStats: {
    damage: number;
    fireRate: number;
    range: number;
  };
}

export const Enemy3DSystem: React.FC<Enemy3DSystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  journeyDistance = 0,
  onEnemiesUpdate,
  weaponStats
}) => {
  const [enemies, setEnemies] = useState<Enemy3D[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile3D[]>([]);
  const lastFireTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const enemyTypes = useMemo(() => ({
    fantasy: [
      { type: 'goblin' as const, health: 2, speed: 0.02, size: 1.0 },
      { type: 'orc' as const, health: 4, speed: 0.015, size: 1.3 },
      { type: 'dragon' as const, health: 8, speed: 0.01, size: 1.8 }
    ],
    scifi: [
      { type: 'goblin' as const, health: 2, speed: 0.02, size: 1.0 },
      { type: 'orc' as const, health: 4, speed: 0.015, size: 1.3 },
      { type: 'dragon' as const, health: 8, speed: 0.01, size: 1.8 }
    ]
  }), []);

  // Difficulty scaling based on journey distance
  const getScaledStats = useCallback((baseHealth: number, baseSpeed: number) => {
    const distanceMultiplier = 1 + (journeyDistance / 100) * 0.5;
    return {
      health: Math.floor(baseHealth * distanceMultiplier),
      speed: baseSpeed * (1 + (journeyDistance / 200) * 0.3)
    };
  }, [journeyDistance]);

  // Spawn enemies with scaled difficulty
  useEffect(() => {
    const adjustedSpawnRate = Math.max(800, spawnRate - (journeyDistance * 2));
    
    const spawnInterval = setInterval(() => {
      setEnemies(prev => {
        if (prev.length >= maxEnemies) return prev;
        
        const types = enemyTypes[realm];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const scaledStats = getScaledStats(randomType.health, randomType.speed);
        
        const newEnemy: Enemy3D = {
          id: `enemy_${Date.now()}_${Math.random()}`,
          position: [(Math.random() - 0.5) * 8, 0, 15 + Math.random() * 5],
          health: scaledStats.health,
          maxHealth: scaledStats.health,
          type: randomType.type,
          speed: scaledStats.speed,
          animationState: 'spawn'
        };
        
        return [...prev, newEnemy];
      });
    }, adjustedSpawnRate);

    return () => clearInterval(spawnInterval);
  }, [maxEnemies, spawnRate, realm, enemyTypes, journeyDistance, getScaledStats]);

  // Update parent component with enemy list
  useEffect(() => {
    if (onEnemiesUpdate) {
      onEnemiesUpdate(enemies);
    }
  }, [enemies, onEnemiesUpdate]);

  // Animation loop for enemy movement and combat
  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();

      setEnemies(prev => {
        return prev.map(enemy => {
          if (enemy.animationState === 'death') return enemy;
          
          // Move enemy toward player
          const newZ = enemy.position[2] - enemy.speed;
          
          // Check if enemy reached player
          if (newZ <= -1) {
            onEnemyReachPlayer(enemy);
            return { ...enemy, animationState: 'death' as const };
          }

          return {
            ...enemy,
            position: [enemy.position[0], enemy.position[1], newZ] as [number, number, number],
            animationState: 'walk' as const
          };
        }).filter(enemy => enemy.animationState !== 'death');
      });

      // Auto-fire weapon
      if (currentTime - lastFireTimeRef.current >= weaponStats.fireRate) {
        setEnemies(currentEnemies => {
          const nearestEnemy = currentEnemies
            .filter(enemy => {
              const distance = Math.sqrt(
                enemy.position[0] * enemy.position[0] + 
                enemy.position[2] * enemy.position[2]
              );
              return distance <= weaponStats.range && enemy.animationState !== 'death';
            })
            .sort((a, b) => {
              const distA = Math.sqrt(a.position[0] * a.position[0] + a.position[2] * a.position[2]);
              const distB = Math.sqrt(b.position[0] * b.position[0] + b.position[2] * b.position[2]);
              return distA - distB;
            })[0];

          if (nearestEnemy) {
            const newProjectile: Projectile3D = {
              id: `proj_${currentTime}_${Math.random()}`,
              position: [0, 1, 0],
              targetPosition: nearestEnemy.position,
              speed: 0.3,
              damage: weaponStats.damage
            };

            setProjectiles(prev => [...prev, newProjectile]);
            lastFireTimeRef.current = currentTime;
          }

          return currentEnemies;
        });
      }

      // Move projectiles
      setProjectiles(prev => {
        return prev.map(projectile => {
          const dx = projectile.targetPosition[0] - projectile.position[0];
          const dy = projectile.targetPosition[1] - projectile.position[1];
          const dz = projectile.targetPosition[2] - projectile.position[2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 0.5) {
            // Hit target - damage enemy
            setEnemies(prevEnemies => {
              return prevEnemies.map(enemy => {
                const enemyDistance = Math.sqrt(
                  Math.pow(enemy.position[0] - projectile.position[0], 2) +
                  Math.pow(enemy.position[1] - projectile.position[1], 2) +
                  Math.pow(enemy.position[2] - projectile.position[2], 2)
                );

                if (enemyDistance < 1) {
                  const newHealth = enemy.health - projectile.damage;
                  if (newHealth <= 0) {
                    onEnemyDestroyed(enemy);
                    return { ...enemy, animationState: 'death' as const };
                  }
                  return { ...enemy, health: newHealth };
                }
                return enemy;
              });
            });
            return null;
          }

          // Move towards target
          const newX = projectile.position[0] + (dx / distance) * projectile.speed;
          const newY = projectile.position[1] + (dy / distance) * projectile.speed;
          const newZ = projectile.position[2] + (dz / distance) * projectile.speed;

          return {
            ...projectile,
            position: [newX, newY, newZ] as [number, number, number]
          };
        }).filter(Boolean) as Projectile3D[];
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onEnemyReachPlayer, onEnemyDestroyed, weaponStats]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        {/* 3D Enemies */}
        {enemies.map(enemy => (
          <Enemy3D
            key={enemy.id}
            enemy={enemy}
            realm={realm}
          />
        ))}

        {/* 3D Projectiles */}
        <Projectile3DSystem
          projectiles={projectiles}
          realm={realm}
        />
      </Canvas>
    </div>
  );
};

export { type Enemy3D };

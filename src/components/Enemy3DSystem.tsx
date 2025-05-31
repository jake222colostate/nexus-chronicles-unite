
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Enemy3D } from './Enemy3D';
import { Projectile3D } from './Projectile3D';

interface Enemy3DData {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  type: 'goblin' | 'orc' | 'robot' | 'alien' | 'slime';
  speed: number;
  size: number;
  isSpawning: boolean;
  isDying: boolean;
}

interface Projectile3DData {
  id: string;
  x: number;
  y: number;
  z: number;
  targetId: string;
  speed: number;
  damage: number;
}

interface Enemy3DSystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: Enemy3DData) => void;
  onEnemyDestroyed: (enemy: Enemy3DData) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance?: number;
  onEnemiesUpdate?: (enemies: Enemy3DData[]) => void;
  weaponStats: {
    damage: number;
    fireRate: number;
    range: number;
  };
  onMuzzleFlash: () => void;
}

export const Enemy3DSystem: React.FC<Enemy3DSystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  journeyDistance = 0,
  onEnemiesUpdate,
  weaponStats,
  onMuzzleFlash
}) => {
  const [enemies, setEnemies] = useState<Enemy3DData[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile3DData[]>([]);
  const [lastFireTime, setLastFireTime] = useState(0);

  const enemyTypes = useMemo(() => ({
    fantasy: [
      { type: 'slime' as const, health: 2, speed: 0.8, size: 1.0 },
      { type: 'goblin' as const, health: 3, speed: 1.0, size: 1.1 },
      { type: 'orc' as const, health: 5, speed: 0.6, size: 1.3 }
    ],
    scifi: [
      { type: 'alien' as const, health: 2, speed: 0.9, size: 1.0 },
      { type: 'robot' as const, health: 4, speed: 0.7, size: 1.2 }
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

  // Enemy type selection based on journey distance
  const getEnemyTypeForDistance = useCallback(() => {
    const types = enemyTypes[realm];
    const milestone = Math.floor(journeyDistance / 100);
    
    if (milestone >= types.length) {
      return types[types.length - 1];
    }
    return types[Math.min(milestone, types.length - 1)];
  }, [journeyDistance, realm, enemyTypes]);

  // Spawn enemies with scaling difficulty
  useEffect(() => {
    const adjustedSpawnRate = Math.max(800, spawnRate - (journeyDistance * 2));
    
    const spawnInterval = setInterval(() => {
      if (enemies.length < maxEnemies) {
        const randomType = getEnemyTypeForDistance();
        const scaledStats = getScaledStats(randomType.health, randomType.speed);
        
        const newEnemy: Enemy3DData = {
          id: `enemy_${Date.now()}_${Math.random()}`,
          x: (Math.random() - 0.5) * 12,
          y: 0,
          z: 30 + Math.random() * 10,
          health: scaledStats.health,
          maxHealth: scaledStats.health,
          type: randomType.type,
          speed: scaledStats.speed + (Math.random() - 0.5) * 0.2,
          size: randomType.size,
          isSpawning: true,
          isDying: false
        };
        
        setEnemies(prev => [...prev, newEnemy]);
      }
    }, adjustedSpawnRate);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, maxEnemies, spawnRate, journeyDistance, getEnemyTypeForDistance, getScaledStats]);

  // Update parent component with enemy list
  useEffect(() => {
    if (onEnemiesUpdate) {
      onEnemiesUpdate(enemies);
    }
  }, [enemies, onEnemiesUpdate]);

  // Auto-fire at nearest enemy
  useEffect(() => {
    const fireInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastFireTime >= weaponStats.fireRate) {
        const nearestEnemy = enemies
          .filter(enemy => !enemy.isDying && !enemy.isSpawning)
          .filter(enemy => {
            const distance = Math.sqrt(enemy.x * enemy.x + enemy.z * enemy.z);
            return distance <= weaponStats.range;
          })
          .sort((a, b) => {
            const distA = Math.sqrt(a.x * a.x + a.z * a.z);
            const distB = Math.sqrt(b.x * b.x + b.z * b.z);
            return distA - distB;
          })[0];

        if (nearestEnemy) {
          const newProjectile: Projectile3DData = {
            id: `proj_${Date.now()}_${Math.random()}`,
            x: 0,
            y: 1.5,
            z: 0,
            targetId: nearestEnemy.id,
            speed: 0.5,
            damage: weaponStats.damage
          };

          setProjectiles(prev => [...prev, newProjectile]);
          onMuzzleFlash();
          setLastFireTime(now);
        }
      }
    }, 100);

    return () => clearInterval(fireInterval);
  }, [enemies, weaponStats, onMuzzleFlash, lastFireTime]);

  // Move enemies toward player
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setEnemies(prev => {
        return prev.map(enemy => {
          if (enemy.isSpawning || enemy.isDying) return enemy;
          
          const newZ = enemy.z - enemy.speed * 0.15;
          
          if (newZ <= -2) {
            onEnemyReachPlayer(enemy);
            return { ...enemy, isDying: true };
          }

          return { ...enemy, z: newZ };
        });
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [onEnemyReachPlayer]);

  // Move projectiles
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setProjectiles(prev => {
        return prev.map(projectile => {
          const target = enemies.find(e => e.id === projectile.targetId);
          if (!target || target.isDying) return null;

          const dx = target.x - projectile.x;
          const dy = target.y - projectile.y;
          const dz = target.z - projectile.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 1) {
            // Hit target
            setEnemies(prev => prev.map(enemy => {
              if (enemy.id === target.id) {
                const newHealth = enemy.health - projectile.damage;
                if (newHealth <= 0) {
                  onEnemyDestroyed(enemy);
                  return { ...enemy, isDying: true };
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            }));
            return null;
          }

          // Move towards target
          const newX = projectile.x + (dx / distance) * projectile.speed;
          const newY = projectile.y + (dy / distance) * projectile.speed;
          const newZ = projectile.z + (dz / distance) * projectile.speed;

          return { ...projectile, x: newX, y: newY, z: newZ };
        }).filter(Boolean) as Projectile3DData[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [enemies, onEnemyDestroyed]);

  const handleEnemyClick = useCallback((enemyId: string) => {
    setEnemies(prev => prev.map(enemy => {
      if (enemy.id === enemyId && !enemy.isDying) {
        const newHealth = enemy.health - 1;
        if (newHealth <= 0) {
          onEnemyDestroyed(enemy);
          return { ...enemy, isDying: true };
        }
        return { ...enemy, health: newHealth };
      }
      return enemy;
    }));
  }, [onEnemyDestroyed]);

  const handleAnimationComplete = useCallback((enemyId: string) => {
    setEnemies(prev => {
      const enemy = prev.find(e => e.id === enemyId);
      if (enemy?.isSpawning) {
        return prev.map(e => e.id === enemyId ? { ...e, isSpawning: false } : e);
      } else if (enemy?.isDying) {
        return prev.filter(e => e.id !== enemyId);
      }
      return prev;
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 8], fov: 60 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.8 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Ground plane */}
        <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshLambertMaterial color={realm === 'fantasy' ? '#228B22' : '#2F4F4F'} />
        </mesh>

        {/* 3D Enemies */}
        {enemies.map(enemy => (
          <Enemy3D
            key={enemy.id}
            position={[enemy.x, enemy.y, enemy.z]}
            enemyType={enemy.type}
            realm={realm}
            health={enemy.health}
            maxHealth={enemy.maxHealth}
            isSpawning={enemy.isSpawning}
            isDying={enemy.isDying}
            onAnimationComplete={() => handleAnimationComplete(enemy.id)}
            onClick={() => handleEnemyClick(enemy.id)}
          />
        ))}

        {/* 3D Projectiles */}
        {projectiles.map(projectile => (
          <Projectile3D
            key={projectile.id}
            position={[projectile.x, projectile.y, projectile.z]}
            realm={realm}
          />
        ))}
      </Canvas>
    </div>
  );
};

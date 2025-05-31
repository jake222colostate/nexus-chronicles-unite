
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Enemy3D } from './Enemy3D';
import { Enemy3DDeathEffect } from './Enemy3DDeathEffect';

interface GroundEnemy {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  type: 'slime' | 'goblin' | 'orc';
  speed: number;
  size: number;
}

interface GroundEnemy3DSystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: GroundEnemy) => void;
  onEnemyDestroyed: (enemy: GroundEnemy) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance?: number;
  onEnemiesUpdate?: (enemies: GroundEnemy[]) => void;
}

export const GroundEnemy3DSystem: React.FC<GroundEnemy3DSystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  journeyDistance = 0,
  onEnemiesUpdate
}) => {
  const [enemies, setEnemies] = useState<GroundEnemy[]>([]);
  const [deathEffects, setDeathEffects] = useState<Array<{
    id: string;
    position: [number, number, number];
    realm: 'fantasy' | 'scifi';
  }>>([]);

  const enemyTypes = useMemo(() => ({
    fantasy: [
      { type: 'slime' as const, health: 2, speed: 0.8, size: 1.2 },
      { type: 'goblin' as const, health: 3, speed: 1.0, size: 1.0 },
      { type: 'orc' as const, health: 4, speed: 0.6, size: 1.4 }
    ],
    scifi: [
      { type: 'slime' as const, health: 2, speed: 0.8, size: 1.2 },
      { type: 'goblin' as const, health: 3, speed: 1.0, size: 1.0 },
      { type: 'orc' as const, health: 4, speed: 0.6, size: 1.4 }
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
      if (enemies.length < maxEnemies) {
        const types = enemyTypes[realm];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const scaledStats = getScaledStats(randomType.health, randomType.speed);
        
        const newEnemy: GroundEnemy = {
          id: `enemy_${Date.now()}_${Math.random()}`,
          x: (Math.random() - 0.5) * 12,
          y: 0,
          z: 30 + Math.random() * 10,
          health: scaledStats.health,
          maxHealth: scaledStats.health,
          type: randomType.type,
          speed: scaledStats.speed + (Math.random() - 0.5) * 0.2,
          size: randomType.size
        };
        
        setEnemies(prev => [...prev, newEnemy]);
      }
    }, adjustedSpawnRate);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, maxEnemies, spawnRate, realm, enemyTypes, journeyDistance, getScaledStats]);

  // Update parent component with enemy list
  useEffect(() => {
    if (onEnemiesUpdate) {
      onEnemiesUpdate(enemies);
    }
  }, [enemies, onEnemiesUpdate]);

  // Move enemies toward player
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setEnemies(prev => {
        return prev.map(enemy => {
          const newZ = enemy.z - enemy.speed * 0.15;
          
          // Check if enemy reached player
          if (newZ <= -2) {
            onEnemyReachPlayer(enemy);
            return null;
          }

          return {
            ...enemy,
            z: newZ
          };
        }).filter(Boolean) as GroundEnemy[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [onEnemyReachPlayer]);

  // Handle enemy taking damage
  const handleEnemyDamage = useCallback((enemyId: string, damage: number) => {
    setEnemies(prev => {
      return prev.map(enemy => {
        if (enemy.id === enemyId) {
          const newHealth = enemy.health - damage;
          if (newHealth <= 0) {
            // Add death effect
            setDeathEffects(prev => [...prev, {
              id: `death_${Date.now()}`,
              position: [enemy.x, enemy.y, enemy.z],
              realm
            }]);
            
            onEnemyDestroyed(enemy);
            return null;
          }
          return { ...enemy, health: newHealth };
        }
        return enemy;
      }).filter(Boolean) as GroundEnemy[];
    });
  }, [onEnemyDestroyed, realm]);

  // Expose damage function to parent
  useEffect(() => {
    (window as any).damageEnemy = handleEnemyDamage;
    return () => {
      delete (window as any).damageEnemy;
    };
  }, [handleEnemyDamage]);

  const handleDeathEffectComplete = useCallback((effectId: string) => {
    setDeathEffects(prev => prev.filter(effect => effect.id !== effectId));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ 
          position: [0, 8, 8], 
          fov: 60,
          near: 0.1,
          far: 100
        }}
        shadows
        gl={{ antialias: false, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshPhongMaterial 
            color={realm === 'fantasy' ? '#2d5016' : '#1e293b'} 
            transparent 
            opacity={0.3} 
          />
        </mesh>

        {/* 3D Enemies */}
        {enemies.map((enemy) => (
          <Enemy3D
            key={enemy.id}
            enemy={enemy}
            realm={realm}
            onDamage={handleEnemyDamage}
          />
        ))}

        {/* Death Effects */}
        {deathEffects.map((effect) => (
          <Enemy3DDeathEffect
            key={effect.id}
            position={effect.position}
            realm={effect.realm}
            onComplete={() => handleDeathEffectComplete(effect.id)}
          />
        ))}
      </Canvas>
    </div>
  );
};

export { type GroundEnemy };

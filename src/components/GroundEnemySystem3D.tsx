
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Enemy3D } from './Enemy3D';
import { MODEL_PATHS } from './ModelLoader3D';

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
  spawnTime: number;
}

interface GroundEnemySystem3DProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: GroundEnemy) => void;
  onEnemyDestroyed: (enemy: GroundEnemy) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance?: number;
  onEnemiesUpdate?: (enemies: GroundEnemy[]) => void;
}

export const GroundEnemySystem3D: React.FC<GroundEnemySystem3DProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  journeyDistance = 0,
  onEnemiesUpdate
}) => {
  const [enemies, setEnemies] = useState<GroundEnemy[]>([]);

  const enemyTypes = useMemo(() => ({
    fantasy: [
      { type: 'slime' as const, health: 2, speed: 1.0, size: 1.0 },
      { type: 'goblin' as const, health: 3, speed: 1.2, size: 0.9 },
      { type: 'orc' as const, health: 5, speed: 0.8, size: 1.3 }
    ],
    scifi: [
      { type: 'slime' as const, health: 2, speed: 1.0, size: 1.0 }, // Robot drone
      { type: 'goblin' as const, health: 3, speed: 1.2, size: 0.9 }, // Alien scout
      { type: 'orc' as const, health: 5, speed: 0.8, size: 1.3 } // Mech unit
    ]
  }), []);

  // Spawn enemies with better distribution
  const spawnEnemy = useCallback(() => {
    const types = enemyTypes[realm];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const scaledHealth = Math.floor(randomType.health * (1 + journeyDistance / 50));
    
    const newEnemy: GroundEnemy = {
      id: `enemy_${Date.now()}_${Math.random()}`,
      x: (Math.random() - 0.5) * 16, // Wider spawn area
      y: 0,
      z: 60 + Math.random() * 30, // Spawn very far away (60-90 units)
      health: scaledHealth,
      maxHealth: scaledHealth,
      type: randomType.type,
      speed: randomType.speed + (Math.random() - 0.5) * 0.3,
      size: 1.0,
      spawnTime: Date.now()
    };
    
    console.log('Spawning enemy:', newEnemy.id, 'at position:', newEnemy.x, newEnemy.y, newEnemy.z);
    
    setEnemies(prevEnemies => {
      const currentEnemies = Array.isArray(prevEnemies) ? prevEnemies : [];
      return [...currentEnemies, newEnemy];
    });
  }, [realm, journeyDistance, enemyTypes]);

  // Spawn enemies at regular intervals
  useEffect(() => {
    const adjustedSpawnRate = Math.max(800, spawnRate - (journeyDistance * 3));
    
    const spawnInterval = setInterval(() => {
      if (enemies.length < maxEnemies) {
        spawnEnemy();
      }
    }, adjustedSpawnRate);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, maxEnemies, spawnRate, journeyDistance, spawnEnemy]);

  // Update enemy movement and check for player collision
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setEnemies(prevEnemies => {
        const currentEnemies = Array.isArray(prevEnemies) ? prevEnemies : [];
        const updatedEnemies: GroundEnemy[] = [];
        
        for (const enemy of currentEnemies) {
          // Move toward player (decrease z to move closer)
          const newZ = enemy.z - enemy.speed * 0.4;
          
          console.log(`Enemy ${enemy.id} at z: ${newZ.toFixed(2)}`);
          
          // Check if enemy reached player (when z gets close to 0 or negative)
          if (newZ <= 1) {
            console.log(`Enemy ${enemy.id} reached player!`);
            onEnemyReachPlayer(enemy);
            continue; // Skip adding this enemy to updatedEnemies
          }

          updatedEnemies.push({
            ...enemy,
            z: newZ,
            size: 1.0 // Keep consistent size
          });
        }
        
        return updatedEnemies;
      });
    }, 50);

    return () => clearInterval(updateInterval);
  }, [onEnemyReachPlayer]);

  // Update parent with enemy list
  useEffect(() => {
    if (onEnemiesUpdate && Array.isArray(enemies)) {
      onEnemiesUpdate(enemies);
    }
  }, [enemies, onEnemiesUpdate]);

  // Handle enemy damage
  const handleEnemyDamage = useCallback((enemyId: string, damage: number) => {
    setEnemies(prevEnemies => {
      const currentEnemies = Array.isArray(prevEnemies) ? prevEnemies : [];
      const updatedEnemies: GroundEnemy[] = [];
      
      for (const enemy of currentEnemies) {
        if (enemy.id === enemyId) {
          const newHealth = enemy.health - damage;
          console.log(`Enemy ${enemyId} took ${damage} damage, health: ${newHealth}`);
          if (newHealth <= 0) {
            console.log(`Enemy ${enemyId} destroyed!`);
            onEnemyDestroyed(enemy);
            continue; // Skip adding this enemy to updatedEnemies
          }
          updatedEnemies.push({ ...enemy, health: newHealth });
        } else {
          updatedEnemies.push(enemy);
        }
      }
      
      return updatedEnemies;
    });
  }, [onEnemyDestroyed]);

  // Expose damage function globally for weapon system
  useEffect(() => {
    (window as any).damageEnemy = handleEnemyDamage;
    return () => {
      delete (window as any).damageEnemy;
    };
  }, [handleEnemyDamage]);

  const handleEnemyClick = useCallback((enemyId: string) => {
    console.log(`Enemy ${enemyId} clicked - dealing 1 damage`);
    handleEnemyDamage(enemyId, 1);
  }, [handleEnemyDamage]);

  // Ensure enemies is always an array before rendering
  const safeEnemies = Array.isArray(enemies) ? enemies : [];

  console.log('Rendering enemies:', safeEnemies.length, safeEnemies.map(e => `${e.id}: (${e.x.toFixed(1)}, ${e.y.toFixed(1)}, ${e.z.toFixed(1)})`));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 3D Canvas for enemies with pointer events enabled */}
      <Canvas
        className="pointer-events-auto"
        camera={{ position: [0, 2, 8], fov: 60 }}
        dpr={[1, 2]}
      >
        {/* Enhanced lighting for better visibility */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} />
        
        {/* Render 3D enemies with click handling */}
        {safeEnemies.map(enemy => (
          <Enemy3D
            key={enemy.id}
            enemy={enemy}
            modelPath={MODEL_PATHS.enemies[enemy.type]}
            onClick={() => handleEnemyClick(enemy.id)}
          />
        ))}
      </Canvas>
    </div>
  );
};

export { type GroundEnemy };

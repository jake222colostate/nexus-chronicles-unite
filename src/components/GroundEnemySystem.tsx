
import React, { useState, useEffect, useCallback, useMemo } from 'react';

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

interface GroundEnemySystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: GroundEnemy) => void;
  onEnemyDestroyed: (enemy: GroundEnemy) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance?: number;
  onEnemiesUpdate?: (enemies: GroundEnemy[]) => void;
}

export const GroundEnemySystem: React.FC<GroundEnemySystemProps> = ({
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
      { type: 'slime' as const, emoji: '🟢', health: 2, speed: 0.8, size: 1.2 },
      { type: 'goblin' as const, emoji: '👺', health: 3, speed: 1.0, size: 1.0 },
      { type: 'orc' as const, emoji: '🧌', health: 4, speed: 0.6, size: 1.4 }
    ],
    scifi: [
      { type: 'slime' as const, emoji: '🤖', health: 2, speed: 0.8, size: 1.2 },
      { type: 'goblin' as const, emoji: '👽', health: 3, speed: 1.0, size: 1.0 },
      { type: 'orc' as const, emoji: '🛸', health: 4, speed: 0.6, size: 1.4 }
    ]
  }), []);

  // Difficulty scaling based on journey distance
  const getScaledStats = useCallback((baseHealth: number, baseSpeed: number) => {
    const distanceMultiplier = 1 + (journeyDistance / 100) * 0.5; // Increase by 50% every 100 distance
    return {
      health: Math.floor(baseHealth * distanceMultiplier),
      speed: baseSpeed * (1 + (journeyDistance / 200) * 0.3) // Speed increases more slowly
    };
  }, [journeyDistance]);

  // Spawn enemies with scaled difficulty
  useEffect(() => {
    const adjustedSpawnRate = Math.max(800, spawnRate - (journeyDistance * 2)); // Faster spawning with distance
    
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
            onEnemyDestroyed(enemy);
            return null;
          }
          return { ...enemy, health: newHealth };
        }
        return enemy;
      }).filter(Boolean) as GroundEnemy[];
    });
  }, [onEnemyDestroyed]);

  // Expose damage function to parent
  useEffect(() => {
    (window as any).damageEnemy = handleEnemyDamage;
    return () => {
      delete (window as any).damageEnemy;
    };
  }, [handleEnemyDamage]);

  const handleEnemyClick = useCallback((enemy: GroundEnemy) => {
    handleEnemyDamage(enemy.id, 1);
  }, [handleEnemyDamage]);

  const getEnemyEmoji = useCallback((enemy: GroundEnemy) => {
    const types = enemyTypes[realm];
    const typeData = types.find(t => t.type === enemy.type);
    return typeData?.emoji || '👺';
  }, [realm, enemyTypes]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {enemies.map(enemy => {
        const screenX = 50 + (enemy.x / 15) * 25;
        const screenY = 70 - ((enemy.z / 40) * 30);
        const scale = Math.max(0.8, Math.min(1.5, (40 - enemy.z) / 40));
        
        return (
          <div
            key={enemy.id}
            className="absolute transition-all duration-200 pointer-events-auto cursor-pointer"
            style={{
              left: `${screenX}%`,
              top: `${screenY}%`,
              transform: `translate(-50%, -50%) scale(${scale * enemy.size})`,
              zIndex: Math.floor(50 - enemy.z)
            }}
            onClick={() => handleEnemyClick(enemy)}
          >
            <div className="relative">
              <div className="text-2xl drop-shadow-lg hover:scale-110 transition-transform">
                {getEnemyEmoji(enemy)}
              </div>
              
              {/* Health bar */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8">
                <div className="bg-red-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-400 h-full transition-all duration-200" 
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { type GroundEnemy };

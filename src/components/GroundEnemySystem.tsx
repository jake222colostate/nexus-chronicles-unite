
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
  combatStats?: {
    damage: number;
    autoAimRange: number;
  };
}

export const GroundEnemySystem: React.FC<GroundEnemySystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  combatStats = { damage: 1, autoAimRange: 0 }
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

  // Spawn enemies
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (enemies.length < maxEnemies) {
        const types = enemyTypes[realm];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        const newEnemy: GroundEnemy = {
          id: `enemy_${Date.now()}_${Math.random()}`,
          x: (Math.random() - 0.5) * 12, // Spawn within path width
          y: 0, // Ground level
          z: 30 + Math.random() * 10, // Spawn ahead of player
          health: randomType.health,
          maxHealth: randomType.health,
          type: randomType.type,
          speed: randomType.speed + (Math.random() - 0.5) * 0.2,
          size: randomType.size
        };
        
        setEnemies(prev => [...prev, newEnemy]);
      }
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, maxEnemies, spawnRate, realm, enemyTypes]);

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

  // Auto-attack system
  useEffect(() => {
    if (combatStats.autoAimRange > 0) {
      const attackInterval = setInterval(() => {
        setEnemies(prev => {
          const updatedEnemies = [...prev];
          let enemyHit = false;

          for (let i = 0; i < updatedEnemies.length && !enemyHit; i++) {
            const enemy = updatedEnemies[i];
            const distance = Math.sqrt(enemy.x * enemy.x + enemy.z * enemy.z);
            
            if (distance <= combatStats.autoAimRange) {
              enemy.health -= combatStats.damage;
              
              if (enemy.health <= 0) {
                onEnemyDestroyed(enemy);
                updatedEnemies.splice(i, 1);
              }
              
              enemyHit = true;
            }
          }

          return updatedEnemies;
        });
      }, 1000);

      return () => clearInterval(attackInterval);
    }
  }, [combatStats, onEnemyDestroyed]);

  const handleEnemyClick = useCallback((enemy: GroundEnemy) => {
    setEnemies(prev => {
      return prev.map(e => {
        if (e.id === enemy.id) {
          const newHealth = e.health - combatStats.damage;
          if (newHealth <= 0) {
            onEnemyDestroyed(e);
            return null;
          }
          return { ...e, health: newHealth };
        }
        return e;
      }).filter(Boolean) as GroundEnemy[];
    });
  }, [combatStats.damage, onEnemyDestroyed]);

  const getEnemyEmoji = useCallback((enemy: GroundEnemy) => {
    const types = enemyTypes[realm];
    const typeData = types.find(t => t.type === enemy.type);
    return typeData?.emoji || '👺';
  }, [realm, enemyTypes]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {enemies.map(enemy => {
        // Convert 3D position to 2D screen position (ground level)
        const screenX = 50 + (enemy.x / 15) * 25; // Center with lateral movement
        const screenY = 70 - ((enemy.z / 40) * 30); // Ground level positioning
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

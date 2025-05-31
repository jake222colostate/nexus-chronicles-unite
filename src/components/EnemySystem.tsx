
import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Enemy {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  type: 'eyeball' | 'bat' | 'orb';
  speed: number;
  wigglePhase: number;
}

interface EnemySystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: Enemy) => void;
  onEnemyDestroyed: (enemy: Enemy) => void;
  spawnRate?: number;
  maxEnemies?: number;
  projectiles?: Array<{ id: string; x: number; y: number; z: number; }>;
}

export const EnemySystem: React.FC<EnemySystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 8,
  projectiles = []
}) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const enemyTypes = useMemo(() => ({
    fantasy: [
      { type: 'eyeball' as const, icon: '👁️', health: 1, speed: 0.8 },
      { type: 'bat' as const, icon: '🦇', health: 2, speed: 1.2 },
      { type: 'orb' as const, icon: '🔮', health: 3, speed: 0.6 }
    ],
    scifi: [
      { type: 'eyeball' as const, icon: '🛸', health: 1, speed: 0.8 },
      { type: 'bat' as const, icon: '🤖', health: 2, speed: 1.2 },
      { type: 'orb' as const, icon: '⚡', health: 3, speed: 0.6 }
    ]
  }), []);

  // Spawn enemies
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (enemies.length < maxEnemies) {
        const types = enemyTypes[realm];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        const newEnemy: Enemy = {
          id: `enemy_${Date.now()}_${Math.random()}`,
          x: (Math.random() - 0.5) * 30,
          y: 2 + Math.random() * 8,
          z: 50 + Math.random() * 20,
          health: randomType.health,
          type: randomType.type,
          speed: randomType.speed + (Math.random() - 0.5) * 0.3,
          wigglePhase: Math.random() * Math.PI * 2
        };
        
        setEnemies(prev => [...prev, newEnemy]);
      }
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, maxEnemies, spawnRate, realm, enemyTypes]);

  // Move enemies and check collisions
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setEnemies(prev => {
        return prev.map(enemy => {
          // Move towards player with wiggle motion
          const newZ = enemy.z - enemy.speed * 0.1;
          const wiggleX = enemy.x + Math.sin(enemy.wigglePhase + Date.now() * 0.001) * 0.2;
          const wiggleY = enemy.y + Math.cos(enemy.wigglePhase + Date.now() * 0.0008) * 0.1;
          
          const updatedEnemy = {
            ...enemy,
            x: wiggleX,
            y: wiggleY,
            z: newZ,
            wigglePhase: enemy.wigglePhase + 0.05
          };

          // Check if enemy reached player
          if (newZ <= 0) {
            onEnemyReachPlayer(updatedEnemy);
            return null;
          }

          // Check projectile collisions
          const hitByProjectile = projectiles.some(projectile => {
            const distance = Math.sqrt(
              Math.pow(projectile.x - updatedEnemy.x, 2) +
              Math.pow(projectile.y - updatedEnemy.y, 2) +
              Math.pow(projectile.z - updatedEnemy.z, 2)
            );
            return distance < 2;
          });

          if (hitByProjectile) {
            onEnemyDestroyed(updatedEnemy);
            return null;
          }

          return updatedEnemy;
        }).filter(Boolean) as Enemy[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [onEnemyReachPlayer, onEnemyDestroyed, projectiles]);

  const getEnemyIcon = useCallback((enemy: Enemy) => {
    const types = enemyTypes[realm];
    const typeData = types.find(t => t.type === enemy.type);
    return typeData?.icon || '👁️';
  }, [realm, enemyTypes]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {enemies.map(enemy => {
        // Convert 3D position to 2D screen position
        const screenX = (enemy.x / 30) * 50 + 50; // Convert to percentage
        const screenY = 100 - ((enemy.z / 70) * 100); // Distance becomes Y position
        const scale = Math.max(0.3, Math.min(1.5, (70 - enemy.z) / 70)); // Scale based on distance
        
        return (
          <div
            key={enemy.id}
            className="absolute transition-all duration-100 animate-pulse"
            style={{
              left: `${screenX}%`,
              top: `${screenY}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: Math.floor(enemy.z)
            }}
          >
            <div className={`text-4xl ${enemy.health <= 1 ? 'opacity-60' : ''} filter drop-shadow-lg`}>
              {getEnemyIcon(enemy)}
            </div>
            {/* Health indicator */}
            {enemy.health > 1 && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-red-600 h-1 rounded-full" style={{ width: `${enemy.health * 8}px` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { type Enemy };

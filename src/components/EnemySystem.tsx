
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Enemy } from './Enemy';

interface EnemySystemProps {
  playerPosition: Vector3;
  maxEnemies?: number;
  spawnDistance?: number;
  onEnemiesChange?: (enemies: EnemyData[]) => void;
}

export interface EnemyData {
  id: string;
  position: [number, number, number];
  spawnTime: number;
  health: number;
  maxHealth: number;
  reward: number;
  type: 'demon' | 'orc';
}

export interface EnemySystemHandle {
  damageEnemy: (enemyId: string, damage: number) => { killed: boolean; reward: number } | null;
}
export const EnemySystem = forwardRef<EnemySystemHandle, EnemySystemProps>(
  (
    { playerPosition, maxEnemies = 5, spawnDistance = 100, onEnemiesChange },
    ref
  ) => {
  const [enemies, setEnemies] = useState<EnemyData[]>([]);
  const lastSpawnTime = useRef(0);
  const spawnInterval = 3000; // 3 seconds between spawns

  useEffect(() => {
    if (onEnemiesChange) {
      onEnemiesChange(enemies);
    }
  }, [enemies, onEnemiesChange]);

  // Spawn new enemy ahead of player
  const spawnEnemy = useCallback(() => {
    const now = Date.now();

    if (now - lastSpawnTime.current < spawnInterval) {
      return;
    }

    setEnemies(prev => {
      if (prev.length >= maxEnemies) {
        return prev;
      }

      const spawnZ = playerPosition.z - spawnDistance;
      const spawnX = (Math.random() - 0.5) * 20;

      const distance = Math.abs(playerPosition.z);
      const difficulty = Math.max(1, Math.floor(distance / 200) + 1);
      const reward = 5 * difficulty;
      const type: 'demon' | 'orc' = Math.random() < 0.5 ? 'demon' : 'orc';

      const newEnemy: EnemyData = {
        id: `enemy_${now}_${Math.random()}`,
        position: [spawnX, 1, spawnZ],
        spawnTime: now,
        health: difficulty,
        maxHealth: difficulty,
        reward,
        type
      };

      lastSpawnTime.current = now;
      return [...prev, newEnemy];
    });
  }, [playerPosition.z, maxEnemies, spawnDistance]);

  // Remove enemy when it reaches player or gets too far behind
  const removeEnemy = useCallback((enemyId: string) => {
    setEnemies(prev => prev.filter(enemy => enemy.id !== enemyId));
  }, []);

  const damageEnemy = useCallback((enemyId: string, damage: number) => {
    let result: { killed: boolean; reward: number } | null = null;
    setEnemies(prev => {
      const updated: EnemyData[] = [];
      for (const enemy of prev) {
        if (enemy.id === enemyId) {
          const newHealth = enemy.health - damage;
          if (newHealth <= 0) {
            result = { killed: true, reward: enemy.reward };
            continue;
          } else {
            updated.push({ ...enemy, health: newHealth });
            result = { killed: false, reward: 0 };
          }
        } else {
          updated.push(enemy);
        }
      }
      return updated;
    });
    return result;
  }, []);

  useImperativeHandle(ref, () => ({ damageEnemy }));

  // Spawn enemies periodically and clean up old ones
  useFrame(() => {
    // Try to spawn new enemy
    spawnEnemy();

    // Clean up enemies that are too far behind player
    setEnemies(prev => {
      const filtered = prev.filter(enemy => {
        const enemyZ = enemy.position[2];
        // Positive value indicates the enemy is behind the player
        const distanceBehindPlayer = enemyZ - playerPosition.z;

        // Remove if more than 50 units behind the player
        const shouldKeep = distanceBehindPlayer <= 50;
        if (!shouldKeep) {
          // enemy is far behind, remove it
        }
        return shouldKeep;
      });
      
      if (filtered.length !== prev.length) {
        // cleaned up some enemies
      }
      
      return filtered;
    });
  });



  return (
    <group>
      {enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          data={enemy}
          playerPosition={playerPosition}
          onReachPlayer={() => removeEnemy(enemy.id)}
        />
      ))}
    </group>
  );
});


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
}

export interface EnemySystemHandle {
  damageEnemy: (enemyId: string, damage: number) => void;
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
    console.log(`EnemySystem: Attempting to spawn enemy. Now: ${now}, Last spawn: ${lastSpawnTime.current}, Interval: ${spawnInterval}`);
    
    if (now - lastSpawnTime.current < spawnInterval) {
      console.log(`EnemySystem: Too soon to spawn (${now - lastSpawnTime.current}ms since last spawn)`);
      return;
    }

    setEnemies(prev => {
      console.log(`EnemySystem: Current enemy count: ${prev.length}, Max: ${maxEnemies}`);
      
      if (prev.length >= maxEnemies) {
        console.log(`EnemySystem: Max enemies reached (${prev.length}/${maxEnemies})`);
        return prev;
      }

      // Spawn enemy 100m ahead of player's Z position
      const spawnZ = playerPosition.z - spawnDistance;
      
      // Random X position near the path
      const spawnX = (Math.random() - 0.5) * 20; // ±10 units from center
      
      const newEnemy: EnemyData = {
        id: `enemy_${now}_${Math.random()}`,
        position: [spawnX, 1, spawnZ], // Y=1 to place on ground
        spawnTime: now,
        health: 1
      };

      console.log(`EnemySystem: Spawning enemy at position [${spawnX}, 1, ${spawnZ}], player at [${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}]`);
      
      lastSpawnTime.current = now;
      return [...prev, newEnemy];
    });
  }, [playerPosition.z, maxEnemies, spawnDistance]);

  // Remove enemy when it reaches player or gets too far behind
  const removeEnemy = useCallback((enemyId: string) => {
    console.log(`EnemySystem: Removing enemy ${enemyId}`);
    setEnemies(prev => prev.filter(enemy => enemy.id !== enemyId));
  }, []);

  const damageEnemy = useCallback((enemyId: string, damage: number) => {
    setEnemies(prev => {
      return prev
        .map(enemy =>
          enemy.id === enemyId
            ? { ...enemy, health: enemy.health - damage }
            : enemy
        )
        .filter(enemy => enemy.health > 0);
    });
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
          console.log(
            `EnemySystem: Cleaning up enemy at Z=${enemyZ}, player at Z=${playerPosition.z}, distance behind: ${distanceBehindPlayer}`
          );
        }
        return shouldKeep;
      });
      
      if (filtered.length !== prev.length) {
        console.log(`EnemySystem: Cleaned up ${prev.length - filtered.length} enemies`);
      }
      
      return filtered;
    });
  });

  console.log(`EnemySystem: Rendering ${enemies.length} enemies`);

  return (
    <group>
      {enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          position={enemy.position}
          playerPosition={playerPosition}
          onReachPlayer={() => removeEnemy(enemy.id)}
        />
      ))}
    </group>
  );
});


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
  onEnemyInitialize?: (id: string, position: [number, number, number]) => void;
}

export interface EnemyData {
  id: string;
  position: [number, number, number];
  spawnTime: number;
  health: number;
  type: 'vampire_bat';
}

export interface EnemySystemHandle {
  damageEnemy: (enemyId: string, damage: number) => void;
}

export const EnemySystem = forwardRef<EnemySystemHandle, EnemySystemProps>(
  (
    { playerPosition, maxEnemies = 5, spawnDistance = 100, onEnemiesChange, onEnemyInitialize },
    ref
  ) => {
  const [enemies, setEnemies] = useState<EnemyData[]>([]);
  const lastSpawnTime = useRef(0);
  const lastPlayerZ = useRef(0);
  const lastCleanupTime = useRef(0);
  const spawnInterval = 3000; // 3 seconds between spawns
  const cleanupInterval = 1000; // 1 second between cleanup checks

  // Only notify of enemy changes when the array actually changes
  const lastEnemyCount = useRef(0);
  useEffect(() => {
    if (enemies.length !== lastEnemyCount.current && onEnemiesChange) {
      lastEnemyCount.current = enemies.length;
      onEnemiesChange(enemies);
    }
  }, [enemies.length, onEnemiesChange]);

  // Spawn new vampire bat enemy ahead of player
  const spawnEnemy = useCallback(() => {
    const now = Date.now();
    
    if (now - lastSpawnTime.current < spawnInterval) {
      return false;
    }

    setEnemies(prev => {
      if (prev.length >= maxEnemies) {
        return prev;
      }

      // Spawn enemy 100m ahead of player's Z position
      const spawnZ = playerPosition.z - spawnDistance;
      
      // Random X position near the path
      const spawnX = (Math.random() - 0.5) * 20;
      
      const newEnemy: EnemyData = {
        id: `enemy_${now}_${Math.random()}`,
        position: [spawnX, 0, spawnZ],
        spawnTime: now,
        health: 1,
        type: 'vampire_bat'
      };

      console.log(`EnemySystem: Spawning vampire_bat enemy ${newEnemy.id} at position [${spawnX}, 0, ${spawnZ}]`);
      
      lastSpawnTime.current = now;
      return [...prev, newEnemy];
    });
    
    return true;
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

  // Optimized frame loop - only run expensive operations when needed
  useFrame(() => {
    const now = Date.now();
    const currentPlayerZ = Math.floor(playerPosition.z / 10) * 10;
    
    // Only spawn if player has moved significantly or enough time has passed
    if (currentPlayerZ !== lastPlayerZ.current || now - lastSpawnTime.current > spawnInterval) {
      spawnEnemy();
      lastPlayerZ.current = currentPlayerZ;
    }

    // Clean up enemies less frequently
    if (now - lastCleanupTime.current > cleanupInterval) {
      setEnemies(prev => {
        const filtered = prev.filter(enemy => {
          const enemyZ = enemy.position[2];
          const distanceBehindPlayer = enemyZ - playerPosition.z;
          return distanceBehindPlayer <= 50;
        });
        
        lastCleanupTime.current = now;
        return filtered.length !== prev.length ? filtered : prev;
      });
    }
  });

  return (
    <group>
      {enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          enemyId={enemy.id}
          position={enemy.position}
          playerPosition={playerPosition}
          enemyType={enemy.type}
          onReachPlayer={() => removeEnemy(enemy.id)}
          onInitialize={onEnemyInitialize}
        />
      ))}
    </group>
  );
});

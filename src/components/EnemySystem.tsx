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
import { Monster } from './Monster';
import { BatMinion } from './BatMinion';
import { Leech } from './Leech';
import { useEnemyDamageSystem } from '../hooks/useEnemyDamageSystem';

interface EnemySystemProps {
  playerPosition: Vector3;
  maxEnemies?: number;
  spawnDistance?: number;
  onEnemiesChange?: (enemies: EnemyData[]) => void;
  onEnemyInitialize?: (id: string, position: [number, number, number]) => void;
  damageSystem?: ReturnType<typeof useEnemyDamageSystem>;
}

export type EnemyType = 'vampire_bat' | 'monster' | 'leech';

export interface EnemyData {
  id: string;
  position: [number, number, number];
  spawnTime: number;
  health: number;
  type: EnemyType;
}

export interface EnemySystemHandle {
  damageEnemy: (enemyId: string, damage: number) => void;
}

export const EnemySystem = forwardRef<EnemySystemHandle, EnemySystemProps>(
  (
    { playerPosition, maxEnemies = 8, spawnDistance = 100, onEnemiesChange, onEnemyInitialize, damageSystem },
    ref
  ) => {
  const [enemies, setEnemies] = useState<EnemyData[]>([]);
  const lastSpawnTime = useRef(0);
  const lastPlayerZ = useRef(0);
  const lastCleanupTime = useRef(0);
  const spawnInterval = 1500; // REDUCED: 1.5 seconds between spawns for more frequent spawning
  const cleanupInterval = 1000; // 1 second between cleanup checks

  // Only notify of enemy changes when the array actually changes
  const lastEnemyCount = useRef(0);
  useEffect(() => {
    if (enemies.length !== lastEnemyCount.current && onEnemiesChange) {
      lastEnemyCount.current = enemies.length;
      onEnemiesChange(enemies);
    }
  }, [enemies.length, onEnemiesChange]);

  // IMPROVED: Spawn new enemy more frequently with better distribution including leech
  const spawnEnemy = useCallback(() => {
    const now = Date.now();
    
    if (now - lastSpawnTime.current < spawnInterval) {
      return false;
    }

    setEnemies(prev => {
      if (prev.length >= maxEnemies) {
        return prev;
      }

      // IMPROVED: Spawn enemies at varying distances ahead of player
      const spawnDistance = 60 + Math.random() * 80; // Between 60-140m ahead
      const spawnZ = playerPosition.z - spawnDistance;
      
      // IMPROVED: Better X position distribution near the path
      const spawnX = (Math.random() - 0.5) * 30; // Wider spread
      
      // IMPROVED: 50% vampire bat, 25% monster, 25% leech
      const rand = Math.random();
      let enemyType: EnemyType;
      if (rand < 0.5) {
        enemyType = 'vampire_bat';
      } else if (rand < 0.75) {
        enemyType = 'monster';
      } else {
        enemyType = 'leech';
      }

      const newEnemy: EnemyData = {
        id: `enemy_${now}_${Math.random()}`,
        position: [spawnX, enemyType === 'vampire_bat' ? 1.5 : enemyType === 'leech' ? 0.2 : 0, spawnZ],
        spawnTime: now,
        health: 1,
        type: enemyType
      };

      console.log(`EnemySystem: Spawning ${enemyType} enemy ${newEnemy.id} at position [${spawnX}, ${enemyType === 'vampire_bat' ? 1.5 : enemyType === 'leech' ? 0.2 : 0}, ${spawnZ}]`);
      
      lastSpawnTime.current = now;
      return [...prev, newEnemy];
    });
    
    return true;
  }, [playerPosition.z, maxEnemies]);

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

  // IMPROVED: More frequent spawning and better cleanup
  useFrame(() => {
    const now = Date.now();
    const currentPlayerZ = Math.floor(playerPosition.z / 5) * 5; // Check more frequently
    
    // IMPROVED: Spawn more frequently
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
          return distanceBehindPlayer <= 80; // Increased cleanup distance
        });
        
        lastCleanupTime.current = now;
        return filtered.length !== prev.length ? filtered : prev;
      });
    }
  });

  return (
    <group>
      {enemies.map((enemy) => {
        const enemyHealth = damageSystem?.getEnemyHealth(enemy.id);
        
        if (enemy.type === 'vampire_bat') {
          return (
            <BatMinion
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={playerPosition}
              enemyHealth={enemyHealth}
              onReachPlayer={() => removeEnemy(enemy.id)}
              onInitialize={onEnemyInitialize}
            />
          );
        }
        
        if (enemy.type === 'monster') {
          return (
            <Monster
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={playerPosition}
              enemyHealth={enemyHealth}
              onReachPlayer={() => removeEnemy(enemy.id)}
              onInitialize={onEnemyInitialize}
            />
          );
        }
        
        if (enemy.type === 'leech') {
          return (
            <Leech
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={playerPosition}
              enemyHealth={enemyHealth}
              onReachPlayer={() => removeEnemy(enemy.id)}
              onInitialize={onEnemyInitialize}
            />
          );
        }
        
        return null;
      })}
    </group>
  );
});

export default EnemySystem;

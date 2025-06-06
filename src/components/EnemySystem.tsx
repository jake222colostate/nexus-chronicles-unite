
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
import { GreatFairy } from './GreatFairy';
import { BatMinion } from './BatMinion';

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
  type: 'vampire_bat' | 'great_fairy' | 'bat_minion';
  parentId?: string; // For minions to track their parent
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

  // Spawn bat minions for a fairy
  const spawnBatMinions = useCallback((fairyId: string, fairyPosition: [number, number, number]) => {
    const now = Date.now();
    const numMinions = 3; // Spawn 3 bat minions
    
    setEnemies(prev => {
      const newMinions: EnemyData[] = [];
      
      for (let i = 0; i < numMinions; i++) {
        const angle = (i / numMinions) * Math.PI * 2;
        const radius = 2;
        const minionX = fairyPosition[0] + Math.cos(angle) * radius;
        const minionZ = fairyPosition[2] + Math.sin(angle) * radius;
        
        const minion: EnemyData = {
          id: `bat_minion_${fairyId}_${i}_${now}`,
          position: [minionX, fairyPosition[1] + 1, minionZ],
          spawnTime: now,
          health: 1,
          type: 'bat_minion',
          parentId: fairyId
        };
        
        newMinions.push(minion);
        console.log(`EnemySystem: Spawning bat minion ${minion.id} for fairy ${fairyId}`);
      }
      
      return [...prev, ...newMinions];
    });
  }, []);

  // Spawn new enemy ahead of player - optimized to reduce calls
  const spawnEnemy = useCallback(() => {
    const now = Date.now();
    
    if (now - lastSpawnTime.current < spawnInterval) {
      return false;
    }

    setEnemies(prev => {
      // Count only main enemies (not minions) for max enemy limit
      const mainEnemies = prev.filter(e => e.type !== 'bat_minion');
      if (mainEnemies.length >= maxEnemies) {
        return prev;
      }

      // Spawn enemy 100m ahead of player's Z position
      const spawnZ = playerPosition.z - spawnDistance;
      
      // Random X position near the path
      const spawnX = (Math.random() - 0.5) * 20;
      
      // Randomly choose enemy type (50% vampire bat, 50% great fairy)
      const enemyType: 'vampire_bat' | 'great_fairy' = Math.random() < 0.5 ? 'vampire_bat' : 'great_fairy';
      
      const newEnemy: EnemyData = {
        id: `enemy_${now}_${Math.random()}`,
        position: [spawnX, 1, spawnZ],
        spawnTime: now,
        health: 1,
        type: enemyType
      };

      console.log(`EnemySystem: Spawning ${enemyType} enemy ${newEnemy.id} at position [${spawnX}, 1, ${spawnZ}]`);
      
      lastSpawnTime.current = now;
      return [...prev, newEnemy];
    });
    
    return true;
  }, [playerPosition.z, maxEnemies, spawnDistance]);

  // Remove enemy when it reaches player or gets too far behind
  const removeEnemy = useCallback((enemyId: string) => {
    console.log(`EnemySystem: Removing enemy ${enemyId}`);
    setEnemies(prev => {
      // Also remove any minions associated with this enemy
      return prev.filter(enemy => enemy.id !== enemyId && enemy.parentId !== enemyId);
    });
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

  // Get fairy position for bat minions to follow
  const getFairyPosition = useCallback((parentId: string): Vector3 | undefined => {
    const fairy = enemies.find(e => e.id === parentId && e.type === 'great_fairy');
    return fairy ? new Vector3(...fairy.position) : undefined;
  }, [enemies]);

  return (
    <group>
      {enemies.map((enemy, index) => {
        // Render the appropriate enemy type
        if (enemy.type === 'great_fairy') {
          return (
            <GreatFairy
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={playerPosition}
              onReachPlayer={() => removeEnemy(enemy.id)}
              onInitialize={onEnemyInitialize}
              onSpawnMinions={spawnBatMinions}
            />
          );
        } else if (enemy.type === 'bat_minion') {
          const fairyPosition = enemy.parentId ? getFairyPosition(enemy.parentId) : undefined;
          const orbitalOffset = (index % 3) * (Math.PI * 2 / 3); // Spread minions around fairy
          
          return (
            <BatMinion
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={playerPosition}
              fairyPosition={fairyPosition}
              onReachPlayer={() => removeEnemy(enemy.id)}
              onInitialize={onEnemyInitialize}
              orbitalOffset={orbitalOffset}
            />
          );
        } else {
          return (
            <Enemy
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={playerPosition}
              onReachPlayer={() => removeEnemy(enemy.id)}
              onInitialize={onEnemyInitialize}
            />
          );
        }
      })}
    </group>
  );
});

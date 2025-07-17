import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Mesh } from 'three';
import { useFBX } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';

interface SkeletonEnemySystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  playerPosition: Vector3;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
  realm: 'fantasy' | 'scifi';
}

interface SkeletonEnemy {
  id: string;
  type: 'mage' | 'minion' | 'rogue' | 'warrior';
  position: Vector3;
  health: number;
  maxHealth: number;
  alive: boolean;
  chunkKey: string;
  lastHitTime: number;
  moveDirection: Vector3;
  nextMoveTime: number;
}

const SkeletonModel: React.FC<{ 
  enemy: SkeletonEnemy; 
  onHit: (id: string, damage: number) => void;
}> = ({ enemy, onHit }) => {
  const meshRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const getModelPath = (type: string) => {
    switch (type) {
      case 'mage': return '/assets/KayKit_Skeletons_1.0_FREE/characters/fbx/Skeleton_Mage.fbx';
      case 'minion': return '/assets/KayKit_Skeletons_1.0_FREE/characters/fbx/Skeleton_Minion.fbx';
      case 'rogue': return '/assets/KayKit_Skeletons_1.0_FREE/characters/fbx/Skeleton_Rogue.fbx';
      case 'warrior': return '/assets/KayKit_Skeletons_1.0_FREE/characters/fbx/Skeleton_Warrior.fbx';
      default: return '/assets/KayKit_Skeletons_1.0_FREE/characters/fbx/Skeleton_Minion.fbx';
    }
  };

  const getHealthBarColor = () => {
    const healthPercent = enemy.health / enemy.maxHealth;
    if (healthPercent > 0.6) return '#4ade80';
    if (healthPercent > 0.3) return '#fbbf24';
    return '#ef4444';
  };

  const getSkeletonStats = (type: string) => {
    switch (type) {
      case 'mage': return { scale: 1.2, color: '#8b5cf6' };
      case 'minion': return { scale: 0.8, color: '#94a3b8' };
      case 'rogue': return { scale: 1.0, color: '#22c55e' };
      case 'warrior': return { scale: 1.4, color: '#ef4444' };
      default: return { scale: 1.0, color: '#94a3b8' };
    }
  };

  const stats = getSkeletonStats(enemy.type);
  
  // Load the FBX model
  const fbxModel = useFBX(getModelPath(enemy.type));

  useFrame((state) => {
    if (meshRef.current && enemy.alive) {
      // Simple idle animation
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      meshRef.current.position.y = -0.8 + Math.sin(time * 2) * 0.05;
    }
  });

  if (!enemy.alive) return null;

  return (
    <group
      ref={meshRef}
      position={[enemy.position.x, enemy.position.y, enemy.position.z]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onHit(enemy.id, 25);
      }}
      scale={stats.scale}
    >
      <primitive 
        object={fbxModel.clone()} 
        castShadow
        receiveShadow
      />
      
      {/* Health bar */}
      <group position={[0, 2.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.5, 0.2]} />
          <meshBasicMaterial color="#333" transparent opacity={0.8} />
        </mesh>
        <mesh position={[(-1.5 + (enemy.health / enemy.maxHealth * 1.5)) / 2, 0, 0.01]}>
          <planeGeometry args={[enemy.health / enemy.maxHealth * 1.5, 0.15]} />
          <meshBasicMaterial color={getHealthBarColor()} />
        </mesh>
      </group>

      {/* Hover effect */}
      {hovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2, 8, 8]} />
          <meshBasicMaterial color={stats.color} transparent opacity={0.2} />
        </mesh>
      )}

      {/* Type indicator */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={stats.color} />
      </mesh>
    </group>
  );
};

export const SkeletonEnemySystem: React.FC<SkeletonEnemySystemProps> = ({
  chunks,
  chunkSize,
  playerPosition,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage,
  realm
}) => {
  const [enemies, setEnemies] = useState<SkeletonEnemy[]>([]);
  const lastSpawnTime = useRef<number>(0);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate enemies based on chunks
  const generateEnemies = useMemo(() => {
    const newEnemies: SkeletonEnemy[] = [];
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    chunks.forEach((chunk) => {
      const chunkWorldX = chunk.x * chunkSize;
      const chunkWorldZ = chunk.z * chunkSize;
      const chunkSeed = chunk.x * 1000 + chunk.z;

      // Spawn 1-3 enemies per chunk
      const enemyCount = 1 + Math.floor(seededRandom(chunkSeed) * 3);
      
      for (let i = 0; i < enemyCount; i++) {
        const seed = chunkSeed + i * 100;
        const x = chunkWorldX + seededRandom(seed) * chunkSize;
        const z = chunkWorldZ + seededRandom(seed + 1) * chunkSize;
        
        // Force some enemies to spawn in front of player for testing
        let finalX = x;
        let finalZ = z;
        if (i === 0) {
          finalX = playerPosition.x + 15 + seededRandom(seed) * 10;
          finalZ = playerPosition.z + 15 + seededRandom(seed + 1) * 10;
        }
        
        const types: ('mage' | 'minion' | 'rogue' | 'warrior')[] = ['mage', 'minion', 'rogue', 'warrior'];
        const type = types[Math.floor(seededRandom(seed + 2) * 4)];
        
        const getHealthForType = (type: string) => {
          switch (type) {
            case 'mage': return 80;
            case 'minion': return 50;
            case 'rogue': return 60;
            case 'warrior': return 120;
            default: return 50;
          }
        };

        const health = getHealthForType(type);
        
        newEnemies.push({
          id: `${chunk.x}_${chunk.z}_${type}_${i}`,
          type,
          position: new Vector3(finalX, -0.5, finalZ),
          health,
          maxHealth: health,
          alive: true,
          chunkKey: `${chunk.x}_${chunk.z}`,
          lastHitTime: 0,
          moveDirection: new Vector3(
            seededRandom(seed + 3) - 0.5,
            0,
            seededRandom(seed + 4) - 0.5
          ).normalize(),
          nextMoveTime: Date.now() + Math.random() * 5000
        });
      }
    });

    return newEnemies;
  }, [chunks, chunkSize, playerPosition]);

  // Update enemies state when chunks change
  useEffect(() => {
    setEnemies(generateEnemies);
  }, [generateEnemies]);

  // Update enemy count
  useEffect(() => {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (onEnemyCountChange) {
      onEnemyCountChange(aliveEnemies.length);
    }
  }, [enemies, onEnemyCountChange]);

  // Enemy AI and movement
  useFrame(() => {
    const now = Date.now();
    
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        if (!enemy.alive) return enemy;

        // Simple AI movement
        if (now > enemy.nextMoveTime) {
          const newDirection = new Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
          ).normalize();
          
          return {
            ...enemy,
            moveDirection: newDirection,
            nextMoveTime: now + 3000 + Math.random() * 2000
          };
        }

        // Move enemy
        const moveSpeed = 0.01;
        const newPosition = enemy.position.clone().add(
          enemy.moveDirection.clone().multiplyScalar(moveSpeed)
        );

        return {
          ...enemy,
          position: newPosition
        };
      })
    );
  });

  const handleEnemyHit = (enemyId: string, damage: number) => {
    const now = Date.now();
    
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        if (enemy.id === enemyId && enemy.alive && now - enemy.lastHitTime > 200) {
          const newHealth = enemy.health - damage;
          const newEnemy = {
            ...enemy,
            health: Math.max(0, newHealth),
            alive: newHealth > 0,
            lastHitTime: now
          };
          
          if (newHealth <= 0 && onEnemyKilled) {
            onEnemyKilled();
          }
          
          return newEnemy;
        }
        return enemy;
      })
    );
  };

  // Cull enemies too far from player
  const visibleEnemies = useMemo(() => {
    const renderDistance = 120;
    return enemies.filter(enemy => {
      const distance = enemy.position.distanceTo(playerPosition);
      return distance < renderDistance && enemy.alive;
    });
  }, [enemies, playerPosition]);

  return (
    <group>
      {visibleEnemies.map((enemy) => (
        <SkeletonModel
          key={enemy.id}
          enemy={enemy}
          onHit={handleEnemyHit}
        />
      ))}
    </group>
  );
};
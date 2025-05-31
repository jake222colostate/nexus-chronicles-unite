
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

export interface Enemy3DData {
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

interface Enemy3DSystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: Enemy3DData) => void;
  onEnemyDestroyed: (enemy: Enemy3DData) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance?: number;
  onEnemiesUpdate?: (enemies: Enemy3DData[]) => void;
}

const Enemy3DModel: React.FC<{
  enemy: Enemy3DData;
  onClick: () => void;
  realm: 'fantasy' | 'scifi';
}> = ({ enemy, onClick, realm }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [spawning, setSpawning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSpawning(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getColor = () => {
    if (realm === 'fantasy') {
      switch (enemy.type) {
        case 'slime': return '#4ade80';
        case 'goblin': return '#ef4444';
        case 'orc': return '#8b5cf6';
        default: return '#4ade80';
      }
    } else {
      switch (enemy.type) {
        case 'slime': return '#06b6d4';
        case 'goblin': return '#f59e0b';
        case 'orc': return '#ec4899';
        default: return '#06b6d4';
      }
    }
  };

  const getGeometry = () => {
    switch (enemy.type) {
      case 'slime':
        return <sphereGeometry args={[0.8 * enemy.size, 8, 6]} />;
      case 'goblin':
        return <boxGeometry args={[0.6 * enemy.size, 1.2 * enemy.size, 0.6 * enemy.size]} />;
      case 'orc':
        return <boxGeometry args={[0.8 * enemy.size, 1.4 * enemy.size, 0.8 * enemy.size]} />;
      default:
        return <sphereGeometry args={[0.8 * enemy.size, 8, 6]} />;
    }
  };

  return (
    <group 
      position={[enemy.x, enemy.y, enemy.z]} 
      onClick={onClick}
      scale={spawning ? 0.1 : 1}
    >
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshLambertMaterial 
          color={getColor()} 
          transparent 
          opacity={spawning ? 0.3 : 1} 
        />
      </mesh>
      
      {/* Health bar */}
      <group position={[0, enemy.size * 0.8, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0.2, 0.001]} scale={[(enemy.health / enemy.maxHealth), 1, 1]}>
          <planeGeometry args={[1, 0.08]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
};

export const Enemy3DSystem: React.FC<Enemy3DSystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  journeyDistance = 0,
  onEnemiesUpdate
}) => {
  const [enemies, setEnemies] = useState<Enemy3DData[]>([]);

  const enemyTypes = useMemo(() => ({
    fantasy: [
      { type: 'slime' as const, health: 2, speed: 0.8, size: 1.2 },
      { type: 'goblin' as const, health: 3, speed: 1.0, size: 1.0 },
      { type: 'orc' as const, health: 4, speed: 0.6, size: 1.4 }
    ],
    scifi: [
      { type: 'slime' as const, health: 2, speed: 0.8, size: 1.2 },
      { type: 'goblin' as const, health: 3, speed: 1.0, size: 1.0 },
      { type: 'orc' as const, health: 4, speed: 0.6, size: 1.4 }
    ]
  }), []);

  const getScaledStats = useCallback((baseHealth: number, baseSpeed: number) => {
    const distanceMultiplier = 1 + (journeyDistance / 100) * 0.5;
    return {
      health: Math.floor(baseHealth * distanceMultiplier),
      speed: baseSpeed * (1 + (journeyDistance / 200) * 0.3)
    };
  }, [journeyDistance]);

  // Spawn enemies
  useEffect(() => {
    const adjustedSpawnRate = Math.max(800, spawnRate - (journeyDistance * 2));
    
    const spawnInterval = setInterval(() => {
      if (enemies.length < maxEnemies) {
        const types = enemyTypes[realm];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const scaledStats = getScaledStats(randomType.health, randomType.speed);
        
        const newEnemy: Enemy3DData = {
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

  // Update parent component
  useEffect(() => {
    if (onEnemiesUpdate) {
      onEnemiesUpdate(enemies);
    }
  }, [enemies, onEnemiesUpdate]);

  // Move enemies
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setEnemies(prev => {
        return prev.map(enemy => {
          const newZ = enemy.z - enemy.speed * 0.15;
          
          if (newZ <= -2) {
            onEnemyReachPlayer(enemy);
            return null;
          }

          return { ...enemy, z: newZ };
        }).filter(Boolean) as Enemy3DData[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [onEnemyReachPlayer]);

  // Handle enemy damage
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
      }).filter(Boolean) as Enemy3DData[];
    });
  }, [onEnemyDestroyed]);

  useEffect(() => {
    (window as any).damageEnemy = handleEnemyDamage;
    return () => {
      delete (window as any).damageEnemy;
    };
  }, [handleEnemyDamage]);

  const handleEnemyClick = useCallback((enemy: Enemy3DData) => {
    handleEnemyDamage(enemy.id, 1);
  }, [handleEnemyDamage]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-full h-full pointer-events-auto">
        <Canvas camera={{ position: [0, 10, 20], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {enemies.map(enemy => (
            <Enemy3DModel
              key={enemy.id}
              enemy={enemy}
              onClick={() => handleEnemyClick(enemy)}
              realm={realm}
            />
          ))}
        </Canvas>
      </div>
    </div>
  );
};

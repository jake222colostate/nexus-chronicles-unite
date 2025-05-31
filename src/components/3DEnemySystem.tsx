
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface Enemy3D {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  type: 'goblin' | 'slime' | 'skeleton';
  speed: number;
  size: number;
  isBeingHit: boolean;
}

interface Enemy3DSystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: Enemy3D) => void;
  onEnemyDestroyed: (enemy: Enemy3D) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance: number;
  upgradeCount: number;
  onEnemyHit?: (enemyId: string, damage: number) => void;
}

export const Enemy3DSystem: React.FC<Enemy3DSystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  journeyDistance,
  upgradeCount,
  onEnemyHit
}) => {
  const [enemies, setEnemies] = useState<Enemy3D[]>([]);
  const lastSpawnRef = useRef(0);

  // Calculate scaling based on journey distance and upgrades
  const scalingFactor = useMemo(() => {
    const distanceMultiplier = 1 + Math.floor(journeyDistance / 100) * 0.1;
    const upgradeMultiplier = 1 + upgradeCount * 0.05;
    return distanceMultiplier * upgradeMultiplier;
  }, [journeyDistance, upgradeCount]);

  const enemyTypes = useMemo(() => ({
    fantasy: [
      { type: 'goblin' as const, color: '#8B4513', baseHealth: 2, speed: 1.0, size: 1.0 },
      { type: 'slime' as const, color: '#32CD32', baseHealth: 3, speed: 0.8, size: 1.2 },
      { type: 'skeleton' as const, color: '#F5F5DC', baseHealth: 4, speed: 1.2, size: 0.9 }
    ],
    scifi: [
      { type: 'goblin' as const, color: '#4169E1', baseHealth: 2, speed: 1.0, size: 1.0 },
      { type: 'slime' as const, color: '#FF4500', baseHealth: 3, speed: 0.8, size: 1.2 },
      { type: 'skeleton' as const, color: '#C0C0C0', baseHealth: 4, speed: 1.2, size: 0.9 }
    ]
  }), []);

  // Spawn enemies with scaling
  useEffect(() => {
    const now = Date.now();
    if (now - lastSpawnRef.current > spawnRate && enemies.length < maxEnemies) {
      const types = enemyTypes[realm];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const scaledHealth = Math.ceil(randomType.baseHealth * scalingFactor);
      
      const newEnemy: Enemy3D = {
        id: `enemy3d_${now}_${Math.random()}`,
        x: (Math.random() - 0.5) * 8,
        y: 0,
        z: 25 + Math.random() * 10,
        health: scaledHealth,
        maxHealth: scaledHealth,
        type: randomType.type,
        speed: randomType.speed * (0.8 + Math.random() * 0.4),
        size: randomType.size,
        isBeingHit: false
      };
      
      setEnemies(prev => [...prev, newEnemy]);
      lastSpawnRef.current = now;
    }
  }, [enemies.length, maxEnemies, spawnRate, realm, enemyTypes, scalingFactor]);

  // Move enemies toward player
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setEnemies(prev => {
        return prev.map(enemy => {
          const newZ = enemy.z - enemy.speed * 0.1;
          
          // Reset hit animation
          const updatedEnemy = {
            ...enemy,
            z: newZ,
            isBeingHit: false
          };
          
          // Check if enemy reached player
          if (newZ <= -2) {
            onEnemyReachPlayer(updatedEnemy);
            return null;
          }

          return updatedEnemy;
        }).filter(Boolean) as Enemy3D[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [onEnemyReachPlayer]);

  const handleEnemyClick = useCallback((enemy: Enemy3D, damage: number = 1) => {
    setEnemies(prev => {
      return prev.map(e => {
        if (e.id === enemy.id) {
          const newHealth = e.health - damage;
          const updatedEnemy = { ...e, health: newHealth, isBeingHit: true };
          
          if (onEnemyHit) {
            onEnemyHit(enemy.id, damage);
          }
          
          if (newHealth <= 0) {
            onEnemyDestroyed(updatedEnemy);
            return null;
          }
          return updatedEnemy;
        }
        return e;
      }).filter(Boolean) as Enemy3D[];
    });
  }, [onEnemyDestroyed, onEnemyHit]);

  const getEnemyMesh = useCallback((enemy: Enemy3D) => {
    const types = enemyTypes[realm];
    const typeData = types.find(t => t.type === enemy.type);
    const color = typeData?.color || '#8B4513';
    
    switch (enemy.type) {
      case 'goblin':
        return (
          <group>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.3, 0.8]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow>
              <sphereGeometry args={[0.25]} />
              <meshLambertMaterial color={color} />
            </mesh>
          </group>
        );
      case 'slime':
        return (
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.4, 12, 8]} />
            <meshLambertMaterial color={color} transparent opacity={0.8} />
          </mesh>
        );
      case 'skeleton':
        return (
          <group>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.3, 0.8, 0.2]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshLambertMaterial color={color} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshLambertMaterial color={color} />
          </mesh>
        );
    }
  }, [realm, enemyTypes]);

  return (
    <>
      {enemies.map(enemy => {
        const healthPercent = (enemy.health / enemy.maxHealth) * 100;
        
        return (
          <group
            key={enemy.id}
            position={[enemy.x, enemy.y + 0.5, enemy.z]}
            scale={[enemy.size, enemy.size, enemy.size]}
            onClick={() => handleEnemyClick(enemy)}
          >
            {/* 3D Enemy Model */}
            <group className={enemy.isBeingHit ? 'animate-pulse' : ''}>
              {getEnemyMesh(enemy)}
            </group>
            
            {/* Health Bar */}
            <group position={[0, 1.2, 0]}>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[0.8, 0.1]} />
                <meshBasicMaterial color="#333" transparent opacity={0.8} />
              </mesh>
              <mesh position={[-0.4 + (0.8 * healthPercent / 100) / 2, 0, 0.01]}>
                <planeGeometry args={[0.8 * healthPercent / 100, 0.08]} />
                <meshBasicMaterial color={healthPercent > 50 ? "#4ade80" : healthPercent > 25 ? "#eab308" : "#ef4444"} />
              </mesh>
            </group>
          </group>
        );
      })}
    </>
  );
};

export { type Enemy3D };


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Enemy3D } from './Enemy3D';

interface Enemy3DData {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  type: 'goblin' | 'orc' | 'dragon';
  speed: number;
  size: number;
  modelUrl: string;
  isDying: boolean;
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
      { 
        type: 'goblin' as const, 
        health: 2, 
        speed: 0.8, 
        size: 0.8,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BrainStem/glTF/BrainStem.gltf'
      },
      { 
        type: 'orc' as const, 
        health: 4, 
        speed: 0.6, 
        size: 1.2,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMan/glTF/CesiumMan.gltf'
      },
      { 
        type: 'dragon' as const, 
        health: 8, 
        speed: 0.4, 
        size: 1.5,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/RiggedSimple/glTF/RiggedSimple.gltf'
      }
    ],
    scifi: [
      { 
        type: 'goblin' as const, 
        health: 2, 
        speed: 0.8, 
        size: 0.8,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BrainStem/glTF/BrainStem.gltf'
      },
      { 
        type: 'orc' as const, 
        health: 4, 
        speed: 0.6, 
        size: 1.2,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMan/glTF/CesiumMan.gltf'
      },
      { 
        type: 'dragon' as const, 
        health: 8, 
        speed: 0.4, 
        size: 1.5,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/RiggedSimple/glTF/RiggedSimple.gltf'
      }
    ]
  }), []);

  // Difficulty scaling based on journey distance
  const getScaledStats = useCallback((baseHealth: number, baseSpeed: number) => {
    const distanceMultiplier = 1 + (journeyDistance / 100) * 0.5;
    return {
      health: Math.floor(baseHealth * distanceMultiplier),
      speed: baseSpeed * (1 + (journeyDistance / 200) * 0.3)
    };
  }, [journeyDistance]);

  // Enemy type selection based on progress
  const getEnemyTypeForProgress = useCallback(() => {
    const types = enemyTypes[realm];
    if (journeyDistance < 50) {
      return types[0]; // Goblins
    } else if (journeyDistance < 150) {
      return Math.random() < 0.7 ? types[0] : types[1]; // Mostly goblins, some orcs
    } else if (journeyDistance < 300) {
      return Math.random() < 0.4 ? types[0] : Math.random() < 0.7 ? types[1] : types[2]; // Mixed
    } else {
      return Math.random() < 0.2 ? types[1] : types[2]; // Mostly dragons
    }
  }, [realm, journeyDistance, enemyTypes]);

  // Spawn enemies with scaled difficulty
  useEffect(() => {
    const adjustedSpawnRate = Math.max(800, spawnRate - (journeyDistance * 2));
    
    const spawnInterval = setInterval(() => {
      if (enemies.length < maxEnemies) {
        const selectedType = getEnemyTypeForProgress();
        const scaledStats = getScaledStats(selectedType.health, selectedType.speed);
        
        const newEnemy: Enemy3DData = {
          id: `enemy_${Date.now()}_${Math.random()}`,
          x: (Math.random() - 0.5) * 12,
          y: 0,
          z: 30 + Math.random() * 10,
          health: scaledStats.health,
          maxHealth: scaledStats.health,
          type: selectedType.type,
          speed: scaledStats.speed + (Math.random() - 0.5) * 0.2,
          size: selectedType.size,
          modelUrl: selectedType.modelUrl,
          isDying: false
        };
        
        setEnemies(prev => [...prev, newEnemy]);
      }
    }, adjustedSpawnRate);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, maxEnemies, spawnRate, journeyDistance, getScaledStats, getEnemyTypeForProgress]);

  // Update parent component with enemy list
  useEffect(() => {
    if (onEnemiesUpdate) {
      onEnemiesUpdate(enemies);
    }
  }, [enemies, onEnemiesUpdate]);

  // Move enemies toward player
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setEnemies(prev => {
        return prev.map(enemy => {
          if (enemy.isDying) return enemy;
          
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
        }).filter(Boolean) as Enemy3DData[];
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [onEnemyReachPlayer]);

  // Handle enemy taking damage
  const handleEnemyDamage = useCallback((enemyId: string, damage: number) => {
    setEnemies(prev => {
      return prev.map(enemy => {
        if (enemy.id === enemyId && !enemy.isDying) {
          const newHealth = enemy.health - damage;
          if (newHealth <= 0) {
            // Start death animation
            setTimeout(() => {
              setEnemies(current => current.filter(e => e.id !== enemyId));
              onEnemyDestroyed(enemy);
            }, 2000); // Death animation duration
            
            return { ...enemy, health: 0, isDying: true };
          }
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });
    });
  }, [onEnemyDestroyed]);

  // Expose damage function to parent
  useEffect(() => {
    (window as any).damageEnemy = handleEnemyDamage;
    return () => {
      delete (window as any).damageEnemy;
    };
  }, [handleEnemyDamage]);

  const handleEnemyClick = useCallback((enemyId: string) => {
    handleEnemyDamage(enemyId, 1);
  }, [handleEnemyDamage]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        
        {/* 3D Enemies */}
        {enemies.map(enemy => {
          // Convert game coordinates to 3D world coordinates
          const worldX = enemy.x;
          const worldY = enemy.y;
          const worldZ = -enemy.z + 20; // Invert Z and offset for camera view
          
          return (
            <group
              key={enemy.id}
              onClick={() => handleEnemyClick(enemy.id)}
              style={{ cursor: 'pointer' }}
            >
              <Enemy3D
                modelUrl={enemy.modelUrl}
                position={[worldX, worldY, worldZ]}
                scale={enemy.size}
                health={enemy.health}
                maxHealth={enemy.maxHealth}
                isMoving={!enemy.isDying}
                isDying={enemy.isDying}
                onDeathComplete={() => {
                  setEnemies(current => current.filter(e => e.id !== enemy.id));
                  onEnemyDestroyed(enemy);
                }}
              />
            </group>
          );
        })}
      </Canvas>
    </div>
  );
};

export { type Enemy3DData };


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera } from '@react-three/drei';
import { Group, Mesh, AnimationMixer, AnimationAction, Clock } from 'three';

interface Enemy3D {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  type: 'warrior' | 'archer' | 'mage';
  speed: number;
  size: number;
  targetX: number;
  targetZ: number;
  isSpawning: boolean;
  isDying: boolean;
  spawnTime: number;
}

interface Enemy3DSystemProps {
  realm: 'fantasy' | 'scifi';
  onEnemyReachPlayer: (enemy: Enemy3D) => void;
  onEnemyDestroyed: (enemy: Enemy3D) => void;
  spawnRate?: number;
  maxEnemies?: number;
  journeyDistance?: number;
  onEnemiesUpdate?: (enemies: Enemy3D[]) => void;
}

// 3D Enemy Model Component
const Enemy3DModel: React.FC<{
  enemy: Enemy3D;
  realm: 'fantasy' | 'scifi';
  onAnimationComplete?: (enemyId: string, animationType: string) => void;
}> = ({ enemy, realm, onAnimationComplete }) => {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const clockRef = useRef(new Clock());
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  
  // Model URLs for different enemy types and realms
  const modelUrls = useMemo(() => ({
    fantasy: {
      warrior: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb',
      archer: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb',
      mage: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb'
    },
    scifi: {
      warrior: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb',
      archer: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb',
      mage: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_03.glb'
    }
  }), []);

  const modelUrl = modelUrls[realm][enemy.type];
  
  // Load GLB model with error handling
  let gltf = null;
  try {
    gltf = useGLTF(modelUrl);
  } catch (error) {
    console.warn('Failed to load enemy model:', error);
  }

  // Animation frame update
  useFrame(() => {
    if (mixerRef.current && groupRef.current) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
      
      // Handle spawn animation
      if (enemy.isSpawning) {
        const spawnProgress = Math.min((Date.now() - enemy.spawnTime) / 1000, 1);
        groupRef.current.scale.setScalar(spawnProgress * enemy.size);
        groupRef.current.position.y = enemy.y + (1 - spawnProgress) * 2;
        
        if (spawnProgress >= 1 && onAnimationComplete) {
          onAnimationComplete(enemy.id, 'spawn');
        }
      } else if (enemy.isDying) {
        // Death animation - fade and fall
        const deathProgress = Math.min((Date.now() - enemy.spawnTime) / 800, 1);
        groupRef.current.scale.setScalar(enemy.size * (1 - deathProgress * 0.5));
        groupRef.current.position.y = enemy.y - deathProgress * 1;
        groupRef.current.rotation.z = deathProgress * Math.PI * 0.5;
        
        if (deathProgress >= 1 && onAnimationComplete) {
          onAnimationComplete(enemy.id, 'death');
        }
      } else {
        // Normal movement
        groupRef.current.position.set(enemy.x, enemy.y, enemy.z);
        groupRef.current.scale.setScalar(enemy.size);
        
        // Walking animation based on movement
        const isMoving = Math.abs(enemy.x - enemy.targetX) > 0.1 || Math.abs(enemy.z - enemy.targetZ) > 0.1;
        const desiredAnimation = isMoving ? 'walk' : 'idle';
        
        if (desiredAnimation !== currentAnimation) {
          setCurrentAnimation(desiredAnimation);
        }
      }
    }
  });

  // Initialize animation mixer
  useEffect(() => {
    if (gltf?.scene && gltf?.animations?.length > 0) {
      const mixer = new AnimationMixer(gltf.scene);
      mixerRef.current = mixer;
      
      // Setup default animation
      const idleClip = gltf.animations.find(clip => 
        clip.name.toLowerCase().includes('idle') || 
        clip.name.toLowerCase().includes('stand')
      ) || gltf.animations[0];
      
      if (idleClip) {
        const action = mixer.clipAction(idleClip);
        action.play();
      }
      
      return () => {
        mixer.dispose();
      };
    }
  }, [gltf]);

  // Handle animation changes
  useEffect(() => {
    if (mixerRef.current && gltf?.animations) {
      const targetClip = gltf.animations.find(clip => 
        clip.name.toLowerCase().includes(currentAnimation)
      ) || gltf.animations[0];
      
      if (targetClip) {
        // Stop all current actions
        mixerRef.current.stopAllAction();
        
        // Play new animation
        const action = mixerRef.current.clipAction(targetClip);
        action.reset();
        action.play();
      }
    }
  }, [currentAnimation, gltf]);

  // Fallback geometry if model fails to load
  if (!gltf?.scene) {
    return (
      <group ref={groupRef} position={[enemy.x, enemy.y, enemy.z]}>
        <mesh>
          <boxGeometry args={[0.8, 1.6, 0.6]} />
          <meshLambertMaterial 
            color={
              enemy.type === 'warrior' ? '#ff4444' :
              enemy.type === 'archer' ? '#44ff44' : '#4444ff'
            } 
          />
        </mesh>
        
        {/* Health bar */}
        <mesh position={[0, 1, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.8}
          />
        </mesh>
        <mesh position={[0, 1, 0.01]}>
          <planeGeometry args={[(enemy.health / enemy.maxHealth), 0.08]} />
          <meshBasicMaterial 
            color="#00ff00" 
            transparent 
            opacity={0.9}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[enemy.x, enemy.y, enemy.z]}>
      <primitive object={gltf.scene.clone()} scale={enemy.size} />
      
      {/* 3D Health bar above enemy */}
      <group position={[0, 2, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.15]} />
          <meshBasicMaterial color="#330000" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[(enemy.health / enemy.maxHealth) * 1.1, 0.12]} />
          <meshBasicMaterial color="#ff2222" transparent opacity={0.9} />
        </mesh>
      </group>
      
      {/* Damage flash effect */}
      {enemy.health < enemy.maxHealth && (
        <mesh>
          <sphereGeometry args={[enemy.size * 1.2]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.3} 
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

// Main 3D Enemy System Component
export const Enemy3DSystem: React.FC<Enemy3DSystemProps> = ({
  realm,
  onEnemyReachPlayer,
  onEnemyDestroyed,
  spawnRate = 2000,
  maxEnemies = 6,
  journeyDistance = 0,
  onEnemiesUpdate
}) => {
  const [enemies, setEnemies] = useState<Enemy3D[]>([]);

  const enemyTypes = useMemo(() => ['warrior', 'archer', 'mage'] as const, []);

  // Difficulty scaling based on journey distance
  const getScaledStats = useCallback((baseHealth: number, baseSpeed: number) => {
    const distanceMultiplier = 1 + (journeyDistance / 100) * 0.5;
    return {
      health: Math.floor(baseHealth * distanceMultiplier),
      speed: baseSpeed * (1 + (journeyDistance / 200) * 0.3)
    };
  }, [journeyDistance]);

  // Spawn enemies with scaled difficulty
  useEffect(() => {
    const adjustedSpawnRate = Math.max(800, spawnRate - (journeyDistance * 2));
    
    const spawnInterval = setInterval(() => {
      if (enemies.length < maxEnemies) {
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const baseHealth = randomType === 'warrior' ? 4 : randomType === 'archer' ? 3 : 2;
        const baseSpeed = randomType === 'warrior' ? 0.6 : randomType === 'archer' ? 1.0 : 0.8;
        const scaledStats = getScaledStats(baseHealth, baseSpeed);
        
        const spawnX = (Math.random() - 0.5) * 12;
        const spawnZ = 25 + Math.random() * 10;
        
        const newEnemy: Enemy3D = {
          id: `enemy3d_${Date.now()}_${Math.random()}`,
          x: spawnX,
          y: 0,
          z: spawnZ,
          health: scaledStats.health,
          maxHealth: scaledStats.health,
          type: randomType,
          speed: scaledStats.speed + (Math.random() - 0.5) * 0.2,
          size: 0.8 + Math.random() * 0.4,
          targetX: Math.random() * 4 - 2,
          targetZ: -2,
          isSpawning: true,
          isDying: false,
          spawnTime: Date.now()
        };
        
        setEnemies(prev => [...prev, newEnemy]);
      }
    }, adjustedSpawnRate);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, maxEnemies, spawnRate, journeyDistance, enemyTypes, getScaledStats]);

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
          if (enemy.isSpawning || enemy.isDying) return enemy;
          
          // Move toward target position
          const dx = enemy.targetX - enemy.x;
          const dz = enemy.targetZ - enemy.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (distance > 0.1) {
            const moveX = (dx / distance) * enemy.speed * 0.1;
            const moveZ = (dz / distance) * enemy.speed * 0.1;
            
            return {
              ...enemy,
              x: enemy.x + moveX,
              z: enemy.z + moveZ
            };
          } else {
            // Reached target, check if reached player
            if (enemy.z <= -1.5) {
              onEnemyReachPlayer(enemy);
              return null;
            }
            return enemy;
          }
        }).filter(Boolean) as Enemy3D[];
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
            return {
              ...enemy,
              health: 0,
              isDying: true,
              spawnTime: Date.now()
            };
          }
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });
    });
  }, []);

  // Handle animation completions
  const handleAnimationComplete = useCallback((enemyId: string, animationType: string) => {
    if (animationType === 'spawn') {
      setEnemies(prev => prev.map(enemy => 
        enemy.id === enemyId ? { ...enemy, isSpawning: false } : enemy
      ));
    } else if (animationType === 'death') {
      setEnemies(prev => {
        const enemy = prev.find(e => e.id === enemyId);
        if (enemy) {
          onEnemyDestroyed(enemy);
        }
        return prev.filter(e => e.id !== enemyId);
      });
    }
  }, [onEnemyDestroyed]);

  // Expose damage function to parent
  useEffect(() => {
    (window as any).damageEnemy3D = handleEnemyDamage;
    return () => {
      delete (window as any).damageEnemy3D;
    };
  }, [handleEnemyDamage]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 3, 5]}
          fov={60}
          near={0.1}
          far={100}
        />

        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.3}
        />

        {/* Render all 3D enemies */}
        {enemies.map(enemy => (
          <Enemy3DModel
            key={enemy.id}
            enemy={enemy}
            realm={realm}
            onAnimationComplete={handleAnimationComplete}
          />
        ))}

        {/* Ground plane for reference */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshLambertMaterial color="#2a2a2a" transparent opacity={0.1} />
        </mesh>
      </Canvas>
    </div>
  );
};

export { type Enemy3D };

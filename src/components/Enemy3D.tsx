
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { GroundEnemy } from './GroundEnemySystem';

interface Enemy3DProps {
  enemy: GroundEnemy;
  realm: 'fantasy' | 'scifi';
  onDamage: (enemyId: string, damage: number) => void;
}

export const Enemy3D: React.FC<Enemy3DProps> = ({ enemy, realm, onDamage }) => {
  const meshRef = useRef<Mesh>(null);
  const [isSpawning, setIsSpawning] = useState(true);
  const [isDamaged, setIsDamaged] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Spawning animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpawning(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Damage flash effect
  useEffect(() => {
    if (enemy.health < enemy.maxHealth) {
      setIsDamaged(true);
      const timer = setTimeout(() => setIsDamaged(false), 200);
      return () => clearTimeout(timer);
    }
  }, [enemy.health, enemy.maxHealth]);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    setAnimationPhase(time);

    // Spawning animation - rise from ground
    if (isSpawning) {
      const spawnProgress = Math.min(1, time * 2);
      meshRef.current.position.y = -2 + (spawnProgress * 2);
      meshRef.current.scale.setScalar(spawnProgress * enemy.size);
    } else {
      // Normal position and idle animation
      meshRef.current.position.y = 0.1 + Math.sin(time * 2) * 0.1; // Breathing/bobbing
      meshRef.current.scale.setScalar(enemy.size);
      
      // Walking animation - subtle rotation
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.1;
    }

    // Damage flash
    if (isDamaged && meshRef.current.material) {
      (meshRef.current.material as any).color.setRGB(1, 0.3, 0.3);
    } else if (meshRef.current.material) {
      (meshRef.current.material as any).color.setRGB(1, 1, 1);
    }
  });

  const handleClick = () => {
    onDamage(enemy.id, 1);
  };

  // Get enemy model based on type and realm
  const getEnemyGeometry = () => {
    if (realm === 'fantasy') {
      switch (enemy.type) {
        case 'slime':
          return <sphereGeometry args={[0.8, 8, 6]} />;
        case 'goblin':
          return (
            <group>
              <sphereGeometry args={[0.6, 8, 8]} />
              <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.4, 6, 6]} />
              </mesh>
            </group>
          );
        case 'orc':
          return (
            <group>
              <boxGeometry args={[1, 1.5, 0.8]} />
              <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
              </mesh>
            </group>
          );
        default:
          return <sphereGeometry args={[0.8, 8, 6]} />;
      }
    } else {
      switch (enemy.type) {
        case 'slime':
          return <octahedronGeometry args={[0.8]} />;
        case 'goblin':
          return (
            <group>
              <boxGeometry args={[0.8, 1.2, 0.8]} />
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
              </mesh>
            </group>
          );
        case 'orc':
          return (
            <group>
              <cylinderGeometry args={[0.6, 0.8, 1.5, 8]} />
              <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
              </mesh>
            </group>
          );
        default:
          return <octahedronGeometry args={[0.8]} />;
      }
    }
  };

  const getMaterial = () => {
    const baseColor = realm === 'fantasy' ? 
      (enemy.type === 'slime' ? '#4ade80' : enemy.type === 'goblin' ? '#dc2626' : '#7c2d12') :
      (enemy.type === 'slime' ? '#06b6d4' : enemy.type === 'goblin' ? '#8b5cf6' : '#f59e0b');

    return (
      <meshPhongMaterial
        color={baseColor}
        shininess={realm === 'scifi' ? 100 : 30}
        transparent={isSpawning}
        opacity={isSpawning ? Math.min(1, animationPhase * 2) : 1}
      />
    );
  };

  return (
    <group position={[enemy.x, 0, enemy.z]}>
      {/* Main enemy mesh */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        {getEnemyGeometry()}
        {getMaterial()}
      </mesh>

      {/* Health bar */}
      {enemy.health < enemy.maxHealth && (
        <group position={[0, enemy.size + 0.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.2, 0.1]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <mesh position={[-(1.2/2) + (1.2 * enemy.health / enemy.maxHealth) / 2, 0, 0.01]}>
            <planeGeometry args={[1.2 * (enemy.health / enemy.maxHealth), 0.08]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
      )}

      {/* Spawning particles */}
      {isSpawning && (
        <group>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * 1.5,
                Math.sin(animationPhase * 4) * 0.5,
                Math.sin((i / 8) * Math.PI * 2) * 1.5
              ]}
            >
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial
                color={realm === 'fantasy' ? '#a855f7' : '#06b6d4'}
                transparent
                opacity={1 - Math.min(1, animationPhase)}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

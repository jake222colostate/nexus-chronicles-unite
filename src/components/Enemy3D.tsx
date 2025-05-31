
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Group } from 'three';
import { GroundEnemy } from './GroundEnemy3DSystem';

interface Enemy3DProps {
  enemy: GroundEnemy;
  realm: 'fantasy' | 'scifi';
  onDamage: (enemyId: string, damage: number) => void;
}

export const Enemy3D: React.FC<Enemy3DProps> = ({ enemy, realm, onDamage }) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const [isSpawning, setIsSpawning] = useState(true);
  const [isDamaged, setIsDamaged] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Spawning animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpawning(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Damage flash effect
  useEffect(() => {
    if (enemy.health < enemy.maxHealth) {
      setIsDamaged(true);
      const timer = setTimeout(() => setIsDamaged(false), 300);
      return () => clearTimeout(timer);
    }
  }, [enemy.health, enemy.maxHealth]);

  // Enhanced animation loop
  useFrame((state) => {
    if (!groupRef.current || !bodyRef.current) return;

    const time = state.clock.getElapsedTime();
    setAnimationPhase(time);

    // Spawning animation - rise from ground with rotation
    if (isSpawning) {
      const spawnProgress = Math.min(1, time * 1.5);
      groupRef.current.position.y = -2 + (spawnProgress * 2);
      groupRef.current.scale.setScalar(spawnProgress * enemy.size);
      groupRef.current.rotation.y = spawnProgress * Math.PI * 2;
    } else {
      // Normal animations
      groupRef.current.scale.setScalar(enemy.size);
      
      // Idle breathing animation
      const breathe = 1 + Math.sin(time * 2) * 0.1;
      bodyRef.current.scale.y = breathe;
      
      // Walking animation - side-to-side sway
      groupRef.current.rotation.z = Math.sin(time * 4) * 0.1;
      
      // Forward movement bob
      groupRef.current.position.y = 0.1 + Math.sin(time * 3) * 0.15;
      
      // Subtle rotation while moving
      groupRef.current.rotation.y += 0.01;
    }

    // Damage flash effect
    if (isDamaged && bodyRef.current.material) {
      (bodyRef.current.material as any).color.setRGB(1.5, 0.2, 0.2);
      (bodyRef.current.material as any).emissive.setRGB(0.3, 0, 0);
    } else if (bodyRef.current.material) {
      const baseColor = getBaseColor();
      (bodyRef.current.material as any).color.setRGB(baseColor.r, baseColor.g, baseColor.b);
      (bodyRef.current.material as any).emissive.setRGB(0, 0, 0);
    }
  });

  const handleClick = () => {
    onDamage(enemy.id, 1);
  };

  const getBaseColor = () => {
    if (realm === 'fantasy') {
      switch (enemy.type) {
        case 'slime': return { r: 0.3, g: 0.8, b: 0.3 };
        case 'goblin': return { r: 0.6, g: 0.4, b: 0.2 };
        case 'orc': return { r: 0.4, g: 0.6, b: 0.3 };
        default: return { r: 0.5, g: 0.5, b: 0.5 };
      }
    } else {
      switch (enemy.type) {
        case 'slime': return { r: 0.2, g: 0.7, b: 0.9 };
        case 'goblin': return { r: 0.7, g: 0.3, b: 0.8 };
        case 'orc': return { r: 0.9, g: 0.6, b: 0.2 };
        default: return { r: 0.5, g: 0.5, b: 0.7 };
      }
    }
  };

  // Create proper 3D enemy models based on type and realm
  const getEnemyModel = () => {
    const baseColor = getBaseColor();
    const materialProps = {
      color: [baseColor.r, baseColor.g, baseColor.b],
      metalness: realm === 'scifi' ? 0.6 : 0.1,
      roughness: realm === 'scifi' ? 0.2 : 0.8,
      emissive: [0, 0, 0]
    };

    if (realm === 'fantasy') {
      switch (enemy.type) {
        case 'slime':
          return (
            <group>
              {/* Main slime body */}
              <mesh ref={bodyRef} castShadow>
                <sphereGeometry args={[0.8, 12, 8]} />
                <meshStandardMaterial {...materialProps} transparent opacity={0.8} />
              </mesh>
              {/* Eyes */}
              <mesh position={[-0.3, 0.2, 0.6]} castShadow>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="black" />
              </mesh>
              <mesh position={[0.3, 0.2, 0.6]} castShadow>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="black" />
              </mesh>
            </group>
          );
        
        case 'goblin':
          return (
            <group>
              {/* Body */}
              <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
                <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Head */}
              <mesh position={[0, 0.8, 0]} castShadow>
                <sphereGeometry args={[0.35, 12, 12]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Arms */}
              <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, 0.3]} castShadow>
                <capsuleGeometry args={[0.1, 0.6, 6, 12]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
                <capsuleGeometry args={[0.1, 0.6, 6, 12]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Legs */}
              <mesh position={[-0.2, -0.7, 0]} castShadow>
                <capsuleGeometry args={[0.15, 0.6, 6, 12]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.2, -0.7, 0]} castShadow>
                <capsuleGeometry args={[0.15, 0.6, 6, 12]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
            </group>
          );
        
        case 'orc':
          return (
            <group>
              {/* Main body */}
              <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.8, 1.2, 0.6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Head */}
              <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Arms */}
              <mesh position={[-0.6, 0.3, 0]} rotation={[0, 0, 0.2]} castShadow>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, -0.2]} castShadow>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Legs */}
              <mesh position={[-0.25, -0.9, 0]} castShadow>
                <boxGeometry args={[0.25, 0.8, 0.25]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.25, -0.9, 0]} castShadow>
                <boxGeometry args={[0.25, 0.8, 0.25]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
            </group>
          );
        
        default:
          return (
            <mesh ref={bodyRef} castShadow>
              <sphereGeometry args={[0.8, 12, 8]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          );
      }
    } else {
      // Sci-fi enemies with more angular, robotic designs
      switch (enemy.type) {
        case 'slime':
          return (
            <group>
              {/* Floating drone-like design */}
              <mesh ref={bodyRef} castShadow>
                <octahedronGeometry args={[0.8, 2]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Energy core */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial color="#00ffff" emissive="#001144" />
              </mesh>
              {/* Scanner lights */}
              <mesh position={[-0.4, 0.2, 0.4]}>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshStandardMaterial color="#ff0000" emissive="#440000" />
              </mesh>
              <mesh position={[0.4, 0.2, 0.4]}>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshStandardMaterial color="#ff0000" emissive="#440000" />
              </mesh>
            </group>
          );
        
        case 'goblin':
          return (
            <group>
              {/* Robot body */}
              <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.6, 1.0, 0.4]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Head */}
              <mesh position={[0, 0.7, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Arms */}
              <mesh position={[-0.4, 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.4, 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Legs */}
              <mesh position={[-0.15, -0.7, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.15, -0.7, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Energy indicators */}
              <mesh position={[0, 0.3, 0.25]}>
                <cylinderGeometry args={[0.05, 0.05, 0.1, 6]} />
                <meshStandardMaterial color="#00ff00" emissive="#004400" />
              </mesh>
            </group>
          );
        
        case 'orc':
          return (
            <group>
              {/* Heavy mech design */}
              <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.8, 1.5, 8]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Head/cockpit */}
              <mesh position={[0, 1.0, 0]} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Weapon arms */}
              <mesh position={[-0.7, 0.4, 0]} rotation={[0, 0, 0.3]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 1.0, 6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.7, 0.4, 0]} rotation={[0, 0, -0.3]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 1.0, 6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              {/* Legs */}
              <mesh position={[-0.3, -1.1, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.8, 6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <mesh position={[0.3, -1.1, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.8, 6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
            </group>
          );
        
        default:
          return (
            <mesh ref={bodyRef} castShadow>
              <octahedronGeometry args={[0.8, 1]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          );
      }
    }
  };

  return (
    <group ref={groupRef} position={[enemy.x, 0, enemy.z]} onClick={handleClick}>
      {/* Main enemy model */}
      {getEnemyModel()}

      {/* Health bar */}
      {enemy.health < enemy.maxHealth && (
        <group position={[0, enemy.size + 0.8, 0]}>
          {/* Background bar */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.5, 0.15]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.8} />
          </mesh>
          {/* Health bar */}
          <mesh position={[-(1.5/2) + (1.5 * enemy.health / enemy.maxHealth) / 2, 0, 0.01]}>
            <planeGeometry args={[1.5 * (enemy.health / enemy.maxHealth), 0.12]} />
            <meshBasicMaterial color="#ff3333" />
          </mesh>
        </group>
      )}

      {/* Spawning particles */}
      {isSpawning && (
        <group>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 12) * Math.PI * 2) * 2,
                Math.sin(animationPhase * 6) * 0.8 + 0.5,
                Math.sin((i / 12) * Math.PI * 2) * 2
              ]}
            >
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial
                color={realm === 'fantasy' ? '#9333ea' : '#06b6d4'}
                transparent
                opacity={Math.max(0, 1 - animationPhase)}
              />
            </mesh>
          ))}
          
          {/* Portal ring effect */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <ringGeometry args={[1.5, 2, 16]} />
            <meshBasicMaterial
              color={realm === 'fantasy' ? '#a855f7' : '#0ea5e9'}
              transparent
              opacity={Math.max(0, 0.5 - animationPhase)}
            />
          </mesh>
        </group>
      )}

      {/* Ambient lighting for enemy */}
      <pointLight
        position={[0, 2, 0]}
        intensity={0.3}
        color={realm === 'fantasy' ? '#9333ea' : '#06b6d4'}
        distance={4}
      />
    </group>
  );
};

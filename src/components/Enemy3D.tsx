
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

interface Enemy3DProps {
  position: [number, number, number];
  enemyType: 'goblin' | 'orc' | 'robot' | 'alien' | 'slime';
  realm: 'fantasy' | 'scifi';
  health: number;
  maxHealth: number;
  isSpawning?: boolean;
  isDying?: boolean;
  onAnimationComplete?: () => void;
  onClick?: () => void;
}

export const Enemy3D: React.FC<Enemy3DProps> = ({
  position,
  enemyType,
  realm,
  health,
  maxHealth,
  isSpawning = false,
  isDying = false,
  onAnimationComplete,
  onClick
}) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [walkAnimation, setWalkAnimation] = useState(0);

  // Spawn animation
  useEffect(() => {
    if (isSpawning) {
      setAnimationProgress(0);
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          const next = prev + 0.05;
          if (next >= 1) {
            clearInterval(timer);
            onAnimationComplete?.();
            return 1;
          }
          return next;
        });
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isSpawning, onAnimationComplete]);

  // Death animation
  useEffect(() => {
    if (isDying) {
      setAnimationProgress(1);
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          const next = prev - 0.08;
          if (next <= 0) {
            clearInterval(timer);
            onAnimationComplete?.();
            return 0;
          }
          return next;
        });
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isDying, onAnimationComplete]);

  // Walking animation
  useFrame((state) => {
    if (meshRef.current && !isSpawning && !isDying) {
      setWalkAnimation(prev => prev + 0.1);
      
      // Simple bob animation for walking
      meshRef.current.position.y = position[1] + Math.sin(walkAnimation) * 0.05;
      
      // Face the player (0, 0, 0)
      const direction = new Vector3(-position[0], 0, -position[2]).normalize();
      meshRef.current.lookAt(direction.x, 0, direction.z);
    }

    // Scale animation for spawn/death
    if (groupRef.current) {
      const scale = isSpawning || isDying ? animationProgress : 1;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  const getEnemyGeometry = () => {
    switch (enemyType) {
      case 'goblin':
        return (
          <>
            {/* Body */}
            <boxGeometry args={[0.6, 0.8, 0.4]} />
            <meshLambertMaterial color={realm === 'fantasy' ? '#4a5d23' : '#2a3d13'} />
          </>
        );
      case 'orc':
        return (
          <>
            {/* Body */}
            <boxGeometry args={[0.8, 1.2, 0.6]} />
            <meshLambertMaterial color={realm === 'fantasy' ? '#8b4513' : '#5d2f0a'} />
          </>
        );
      case 'robot':
        return (
          <>
            {/* Body */}
            <boxGeometry args={[0.7, 1.0, 0.5]} />
            <meshLambertMaterial color={realm === 'scifi' ? '#c0c0c0' : '#808080'} />
          </>
        );
      case 'alien':
        return (
          <>
            {/* Body */}
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshLambertMaterial color={realm === 'scifi' ? '#4a9d4a' : '#2d5d2d'} />
          </>
        );
      case 'slime':
        return (
          <>
            {/* Body */}
            <sphereGeometry args={[0.4, 8, 6]} />
            <meshLambertMaterial color={realm === 'fantasy' ? '#32cd32' : '#228b22'} />
          </>
        );
      default:
        return (
          <>
            <boxGeometry args={[0.5, 0.8, 0.4]} />
            <meshLambertMaterial color="#666666" />
          </>
        );
    }
  };

  const healthPercentage = health / maxHealth;

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Main enemy body */}
      <mesh ref={meshRef} position={[0, 0.4, 0]} castShadow receiveShadow>
        {getEnemyGeometry()}
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshLambertMaterial color={realm === 'fantasy' ? '#deb887' : '#a0a0a0'} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 0.6, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshLambertMaterial color={realm === 'fantasy' ? '#deb887' : '#a0a0a0'} />
      </mesh>
      <mesh position={[0.4, 0.6, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshLambertMaterial color={realm === 'fantasy' ? '#deb887' : '#a0a0a0'} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.2, 0.2, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshLambertMaterial color={realm === 'fantasy' ? '#8b4513' : '#654321'} />
      </mesh>
      <mesh position={[0.2, 0.2, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshLambertMaterial color={realm === 'fantasy' ? '#8b4513' : '#654321'} />
      </mesh>

      {/* Health bar */}
      {health < maxHealth && (
        <group position={[0, 1.4, 0]}>
          {/* Background */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.8, 0.1]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          {/* Health fill */}
          <mesh position={[(-0.8 * (1 - healthPercentage)) / 2, 0, 0.02]}>
            <planeGeometry args={[0.8 * healthPercentage, 0.1]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>
      )}
    </group>
  );
};

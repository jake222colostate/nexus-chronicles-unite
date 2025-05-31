
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, AnimationMixer, AnimationAction } from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';
import { Enemy3D as Enemy3DType } from './Enemy3DSystem';

interface Enemy3DProps {
  enemy: Enemy3DType;
  realm: 'fantasy' | 'scifi';
}

// Placeholder 3D geometry for enemies until we have actual .glb models
const EnemyGeometry: React.FC<{ enemy: Enemy3DType; realm: string }> = ({ enemy, realm }) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  // Animate the enemy based on its state
  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    // Position the enemy
    groupRef.current.position.set(...enemy.position);
    
    // Face the player (look at camera)
    groupRef.current.lookAt(0, enemy.position[1], 0);

    // Animation based on state
    switch (enemy.animationState) {
      case 'spawn':
        // Scale in animation
        const scale = Math.min(1, (Date.now() % 1000) / 1000);
        groupRef.current.scale.setScalar(scale);
        break;
      case 'walk':
        // Walking animation - simple bob
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
        groupRef.current.scale.setScalar(1);
        break;
      case 'death':
        // Death animation - fade and fall
        groupRef.current.rotation.x += delta * 2;
        groupRef.current.scale.multiplyScalar(0.95);
        break;
    }
  });

  // Enemy appearance based on type and realm
  const getEnemyColor = () => {
    const colors = {
      fantasy: {
        goblin: '#4ade80',
        orc: '#dc2626', 
        dragon: '#7c3aed'
      },
      scifi: {
        goblin: '#06b6d4',
        orc: '#f59e0b',
        dragon: '#ec4899'
      }
    };
    return colors[realm][enemy.type] || '#666666';
  };

  const getEnemySize = () => {
    const sizes = {
      goblin: 0.8,
      orc: 1.2,
      dragon: 1.8
    };
    return sizes[enemy.type] || 1;
  };

  return (
    <group ref={groupRef}>
      {/* Main body */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6 * getEnemySize(), 1 * getEnemySize(), 0.4 * getEnemySize()]} />
        <meshStandardMaterial color={getEnemyColor()} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2 * getEnemySize(), 0]}>
        <sphereGeometry args={[0.3 * getEnemySize()]} />
        <meshStandardMaterial color={getEnemyColor()} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1 * getEnemySize(), 1.3 * getEnemySize(), 0.25 * getEnemySize()]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1 * getEnemySize(), 1.3 * getEnemySize(), 0.25 * getEnemySize()]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Health bar */}
      {enemy.health > 0 && enemy.health < enemy.maxHealth && (
        <group position={[0, 2 * getEnemySize(), 0]}>
          {/* Background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* Health fill */}
          <mesh position={[-(1 - (enemy.health / enemy.maxHealth)) / 2, 0, 0.001]}>
            <planeGeometry args={[(enemy.health / enemy.maxHealth), 0.08]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const Enemy3D: React.FC<Enemy3DProps> = ({ enemy, realm }) => {
  return <EnemyGeometry enemy={enemy} realm={realm} />;
};

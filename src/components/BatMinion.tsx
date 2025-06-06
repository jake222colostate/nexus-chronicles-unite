
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface BatMinionProps {
  position: [number, number, number];
  playerPosition: Vector3;
  fairyPosition?: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
  orbitalOffset?: number;
}

export const BatMinion: React.FC<BatMinionProps> = ({ 
  position = [0, 0, 0],
  playerPosition, 
  fairyPosition,
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId,
  orbitalOffset = 0
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 2.5;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load vampire bat model
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  useEffect(() => {
    console.log(`BatMinion ${enemyId}: Model loaded:`, !!batScene);
    if (batScene) {
      console.log(`BatMinion ${enemyId}: Scene children:`, batScene.children.length);
    }
  }, [batScene, enemyId]);

  // Initialize as enemy
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`BatMinion ${enemyId} initializing as enemy at position:`, position);
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Handle death
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`BatMinion ${enemyId} starting death fade - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`BatMinion ${enemyId} death complete`);
      }
      return;
    }

    // Reset if alive
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    // AI behavior - orbit fairy or chase player
    let targetPosition = playerPosition.clone();
    
    if (fairyPosition) {
      // Orbit around fairy
      const time = Date.now() * 0.002;
      const orbitRadius = 3;
      const orbitAngle = time + orbitalOffset;
      
      targetPosition = fairyPosition.clone();
      targetPosition.x += Math.cos(orbitAngle) * orbitRadius;
      targetPosition.z += Math.sin(orbitAngle) * orbitRadius;
      targetPosition.y += 2 + Math.sin(time * 3 + orbitalOffset) * 0.5;
    }

    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Update position
    groupRef.current.position.copy(currentPosition.current);

    // Flying animation
    if (groupRef.current) {
      const time = Date.now() * 0.005;
      const flyBob = Math.sin(time * 2 + orbitalOffset) * 0.4;
      const flyWobble = Math.cos(time * 3 + orbitalOffset) * 0.2;
      
      groupRef.current.position.y = currentPosition.current.y + flyBob;
      groupRef.current.position.x = currentPosition.current.x + flyWobble;
      
      // Face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
      
      // Wing flapping
      groupRef.current.rotation.z = Math.sin(time * 8) * 0.2;
      groupRef.current.rotation.x = Math.sin(time * 6) * 0.1;
    }

    // Check collision
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 1.5 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  // Fallback while loading
  if (!batScene) {
    console.log(`BatMinion ${enemyId}: Model loading, showing fallback`);
    return (
      <group ref={groupRef} position={position}>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#330000" />
        </mesh>
        {enemyHealth && enemyHealth.currentHealth > 0 && (
          <EnemyHealthBar 
            enemyHealth={enemyHealth} 
            position={[0, 1.2, 0]} 
          />
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {/* Health bar attached as child - follows bat exactly */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 1.0, 0]} // Positioned above bat at proper scale
        />
      )}
      
      {/* Vampire Bat Model - proper minion scale */}
      <primitive 
        object={batScene.clone()} 
        scale={[0.8, 0.8, 0.8]} // Smaller but visible bat minions
        rotation={[0, Math.PI, 0]} 
        position={[0, 0, 0]}
      />
      
      {/* Debug collision bounds */}
      <mesh visible={false}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial wireframe color="#660000" />
      </mesh>
    </group>
  );
};

// Preload model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

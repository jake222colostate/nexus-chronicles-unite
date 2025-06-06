
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
  orbitalOffset?: number; // For positioning around fairy
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
  const speed = 2.5; // Slightly faster than fairy
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load vampire bat model
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  // Debug log for model loading
  useEffect(() => {
    console.log(`BatMinion ${enemyId}: Model loaded:`, !!batScene);
    if (batScene) {
      console.log(`BatMinion ${enemyId}: Scene children:`, batScene.children.length);
    }
  }, [batScene, enemyId]);

  // Initialize enemy health on mount - only once
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`BatMinion ${enemyId} initializing health system at position:`, position);
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Handle dead enemy - start fade out and disappear
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`BatMinion ${enemyId} starting fade out - health: ${enemyHealth.currentHealth}`);
      }
      
      // Fade out dead enemy quickly
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      // Make enemy completely invisible when scale is very small
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`BatMinion ${enemyId} completely faded out and hidden`);
      }
      return;
    }

    // Reset fade out if enemy is alive again
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    // Determine target position - orbit around fairy if available, otherwise chase player
    let targetPosition = playerPosition.clone();
    
    if (fairyPosition) {
      // Always orbit around fairy when fairy exists
      const time = Date.now() * 0.002;
      const orbitRadius = 3;
      const orbitAngle = time + orbitalOffset;
      
      targetPosition = fairyPosition.clone();
      targetPosition.x += Math.cos(orbitAngle) * orbitRadius;
      targetPosition.z += Math.sin(orbitAngle) * orbitRadius;
      targetPosition.y += 2 + Math.sin(time * 3 + orbitalOffset) * 0.5; // Flying height with bobbing
    }

    // Calculate direction toward target
    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    // Move toward target with bat AI
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Update group position
    groupRef.current.position.copy(currentPosition.current);

    // Add flying animation - bats should have erratic flying motion
    if (groupRef.current) {
      const time = Date.now() * 0.005;
      const flyBob = Math.sin(time * 2 + orbitalOffset) * 0.4;
      const flyWobble = Math.cos(time * 3 + orbitalOffset) * 0.2;
      
      groupRef.current.position.y = currentPosition.current.y + flyBob;
      groupRef.current.position.x = currentPosition.current.x + flyWobble;
      
      // Face the direction of movement
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
      
      // Add wing flapping motion
      groupRef.current.rotation.z = Math.sin(time * 8) * 0.2;
      groupRef.current.rotation.x = Math.sin(time * 6) * 0.1;
    }

    // Check if enemy reached player (within 1.5 units for smaller bats)
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 1.5 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead and faded out
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  // Don't render if model hasn't loaded yet
  if (!batScene) {
    console.log(`BatMinion ${enemyId}: Model not loaded yet, rendering fallback`);
    return (
      <group ref={groupRef} position={position}>
        {/* Fallback dark sphere while model loads */}
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#330000" />
        </mesh>
        {/* Small health bar for minion */}
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
      {/* Small health bar for bat minion */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 1.8, 0]} // Lower than fairy but still visible
        />
      )}
      
      {/* Vampire Bat Model - smaller scale for minions */}
      <primitive 
        object={batScene.clone()} 
        scale={[1.5, 1.5, 1.5]} // Smaller than main enemy bats
        rotation={[0, Math.PI, 0]} 
        position={[0, 0, 0]}
      />
      
      {/* Debug wireframe for bat bounds */}
      <mesh visible={false}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial wireframe color="#660000" />
      </mesh>
    </group>
  );
};

// Preload the vampire bat model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');


import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface GreatFairyProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
}

export const GreatFairy: React.FC<GreatFairyProps> = ({ 
  position = [0, 0, 0],
  playerPosition, 
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 1.5; // Slightly slower than vampire bat
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);

  // Load great fairy model
  const { scene: fairyScene } = useGLTF('/assets/great_fairy.glb');

  // Debug log for model loading
  useEffect(() => {
    console.log(`GreatFairy ${enemyId}: Model loaded:`, !!fairyScene);
    if (fairyScene) {
      console.log(`GreatFairy ${enemyId}: Scene children:`, fairyScene.children.length);
    }
  }, [fairyScene, enemyId]);

  // Initialize enemy health on mount - only once
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`GreatFairy ${enemyId} initializing health system at position:`, position);
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
        console.log(`GreatFairy ${enemyId} starting fade out - health: ${enemyHealth.currentHealth}`);
      }
      
      // Fade out dead enemy quickly
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3); // Faster fade out
      groupRef.current.scale.setScalar(newScale);
      
      // Make enemy completely invisible when scale is very small
      if (newScale <= 0.1) {
        groupRef.current.visible = false;
        console.log(`GreatFairy ${enemyId} completely faded out and hidden`);
      }
      return;
    }

    // Reset fade out if enemy is alive again (shouldn't happen but safety check)
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    // Calculate direction toward player
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    // Move toward player
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Update group position
    groupRef.current.position.copy(currentPosition.current);

    // Add floating animation - fairy should float gracefully
    if (groupRef.current) {
      const time = Date.now() * 0.002;
      const floatOffset = Math.sin(time + position[0]) * 0.5;
      groupRef.current.position.y = currentPosition.current.y + floatOffset;
      
      // Add gentle rotation for magical floating motion
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
    }

    // Check if enemy reached player (within 2 units)
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead and faded out or not visible
  if (enemyHealth && enemyHealth.currentHealth <= 0 && groupRef.current && !groupRef.current.visible) {
    return null;
  }

  // Don't render if model hasn't loaded yet
  if (!fairyScene) {
    console.log(`GreatFairy ${enemyId}: Model not loaded yet, rendering fallback`);
    return (
      <group ref={groupRef} position={position}>
        {/* Fallback pink sphere while model loads */}
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {/* Health bar - only render if enemy health exists and is alive */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 3, 0]} 
        />
      )}
      
      {/* Great Fairy Model */}
      <primitive 
        object={fairyScene.clone()} 
        scale={[1.5, 1.5, 1.5]} 
        rotation={[0, 0, 0]} 
        position={[0, 0, 0]} 
      />
      
      {/* Debug wireframe to see the bounds */}
      <mesh visible={false}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial wireframe color="#ff69b4" />
      </mesh>
    </group>
  );
};

// Preload the great fairy model
useGLTF.preload('/assets/great_fairy.glb');

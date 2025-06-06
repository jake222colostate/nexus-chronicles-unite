
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
  const speed = 1.2; // Slightly slower than vampire bat for walking
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

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
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      // Make enemy completely invisible when scale is very small
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`GreatFairy ${enemyId} completely faded out and hidden`);
      }
      return;
    }

    // Reset fade out if enemy is alive again (shouldn't happen but safety check)
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    // Calculate direction toward player for proper enemy AI
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    // Move toward player on ground level with enemy AI behavior
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Keep fairy at ground level (same as player height)
    currentPosition.current.y = 1.7; // Same as player height

    // Update group position
    groupRef.current.position.copy(currentPosition.current);

    // Add subtle walking animation - gentle bobbing with proper AI
    if (groupRef.current) {
      const time = Date.now() * 0.004;
      const walkBob = Math.sin(time + position[0]) * 0.1; // Much smaller bobbing for walking
      groupRef.current.position.y = currentPosition.current.y + walkBob;
      
      // Face the direction of movement for proper enemy AI behavior
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
    }

    // Check if enemy reached player (within 2 units) - proper enemy collision
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead and faded out - prevent continuous logging
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  // Don't render if model hasn't loaded yet
  if (!fairyScene) {
    console.log(`GreatFairy ${enemyId}: Model not loaded yet, rendering fallback`);
    return (
      <group ref={groupRef} position={position}>
        {/* Fallback pink sphere while model loads */}
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        {/* Health bar positioned above fallback model */}
        {enemyHealth && enemyHealth.currentHealth > 0 && (
          <EnemyHealthBar 
            enemyHealth={enemyHealth} 
            position={[0, 2.2, 0]} 
          />
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {/* Health bar - positioned above fairy model for proper visibility */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2.5, 0]} // Adjusted height for player-sized fairy
        />
      )}
      
      {/* Great Fairy Model - scaled to match player character size */}
      <primitive 
        object={fairyScene.clone()} 
        scale={[0.7, 0.7, 0.7]} // Reduced scale to match player size exactly
        rotation={[0, 0, 0]} 
        position={[0, -0.9, 0]} // Lower position to ensure feet are on ground
      />
      
      {/* Debug wireframe to see the bounds - proper enemy registration bounds */}
      <mesh visible={false}>
        <boxGeometry args={[1.4, 1.7, 1.4]} />
        <meshBasicMaterial wireframe color="#ff69b4" />
      </mesh>
    </group>
  );
};

// Preload the great fairy model
useGLTF.preload('/assets/great_fairy.glb');

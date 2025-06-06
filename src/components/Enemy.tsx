
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface EnemyProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
}

export const Enemy: React.FC<EnemyProps> = ({ 
  position = [0, 0, 0],
  playerPosition, 
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 2;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);

  // Load vampire bat model
  const { scene: batScene, error } = useGLTF('/assets/vampire-bat/source/bat.glb');

  // Debug log for model loading
  useEffect(() => {
    console.log(`Enemy ${enemyId}: Bat model loaded:`, !!batScene, 'Error:', error);
    if (batScene) {
      console.log(`Enemy ${enemyId}: Bat scene children:`, batScene.children.length);
    }
  }, [batScene, error, enemyId]);

  // Initialize enemy health on mount - only once
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`Enemy ${enemyId} initializing health system at position:`, position);
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
        console.log(`Enemy ${enemyId} starting fade out - health: ${enemyHealth.currentHealth}`);
      }
      
      // Fade out dead enemy quickly
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3); // Faster fade out
      groupRef.current.scale.setScalar(newScale);
      
      // Make enemy completely invisible when scale is very small
      if (newScale <= 0.1) {
        groupRef.current.visible = false;
        console.log(`Enemy ${enemyId} completely faded out and hidden`);
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

    // Add flying animation - bat should bob up and down
    if (groupRef.current) {
      const time = Date.now() * 0.003;
      const bobOffset = Math.sin(time + position[0]) * 0.3;
      groupRef.current.position.y = currentPosition.current.y + bobOffset;
      
      // Add slight rotation for more natural flying motion
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
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
  if (!batScene) {
    console.log(`Enemy ${enemyId}: Bat model not loaded yet, rendering fallback`);
    return (
      <group ref={groupRef} position={position}>
        {/* Fallback red sphere while model loads */}
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
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
          position={[0, 2.5, 0]} 
        />
      )}
      
      {/* Vampire Bat Model - with larger scale and better positioning */}
      <primitive 
        object={batScene.clone()} 
        scale={[2, 2, 2]} // Increased scale significantly
        rotation={[0, Math.PI, 0]} // Face the bat toward the player initially
        position={[0, 0, 0]} // Center the model
      />
      
      {/* Debug wireframe to see the bounds */}
      <mesh visible={false}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial wireframe color="#00ff00" />
      </mesh>
    </group>
  );
};

// Preload the vampire bat model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

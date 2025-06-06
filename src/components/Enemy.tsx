import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Mesh } from 'three';
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
  const isFullyFaded = useRef(false);

  // Load vampire bat model - ensure correct path
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  // Debug log for model loading with proper type checking
  useEffect(() => {
    console.log(`Enemy ${enemyId}: Bat model loaded:`, !!batScene);
    if (batScene) {
      console.log(`Enemy ${enemyId}: Bat scene children:`, batScene.children.length);
      
      // Ensure materials are properly loaded with type guards
      batScene.traverse((child) => {
        if (child instanceof Mesh) {
          console.log(`Enemy ${enemyId}: Found mesh:`, child.name, 'Material:', !!child.material);
          if (child.material) {
            // Ensure material is visible
            child.material.visible = true;
            if ('map' in child.material && child.material.map) {
              console.log(`Enemy ${enemyId}: Material has texture:`, !!child.material.map);
            }
          }
        }
      });
    }
  }, [batScene, enemyId]);

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
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      // Make enemy completely invisible when scale is very small
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`Enemy ${enemyId} completely faded out and hidden`);
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

    // Calculate direction toward player for AI movement
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    // Move toward player with proper enemy AI
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Update group position
    groupRef.current.position.copy(currentPosition.current);

    // Add flying animation - bat should bob up and down with proper AI behavior
    if (groupRef.current) {
      const time = Date.now() * 0.003;
      const bobOffset = Math.sin(time + position[0]) * 0.3;
      groupRef.current.position.y = currentPosition.current.y + bobOffset;
      
      // Face the direction of movement for proper AI behavior
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
      
      // Add slight rotation for more natural flying motion
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    }

    // Check if enemy reached player (within 2 units)
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
  if (!batScene) {
    console.log(`Enemy ${enemyId}: Bat model not loaded yet, rendering fallback`);
    return (
      <group ref={groupRef} position={position}>
        {/* Fallback red sphere while model loads */}
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        {/* Health bar positioned above fallback model */}
        {enemyHealth && enemyHealth.currentHealth > 0 && (
          <EnemyHealthBar 
            enemyHealth={enemyHealth} 
            position={[0, 2.5, 0]} 
          />
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {/* Health bar - positioned above bat model */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 3.2, 0]}
        />
      )}
      
      {/* Vampire Bat Model - properly scaled and positioned */}
      <primitive 
        object={batScene.clone()} 
        scale={[2.5, 2.5, 2.5]}
        rotation={[0, Math.PI, 0]}
        position={[0, 0, 0]}
      />
      
      {/* Debug wireframe to see the bounds */}
      <mesh visible={false}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshBasicMaterial wireframe color="#00ff00" />
      </mesh>
    </group>
  );
};

// Preload the vampire bat model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');


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

  // Load vampire bat model
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  useEffect(() => {
    console.log(`Enemy ${enemyId}: Bat model loaded:`, !!batScene);
    if (batScene) {
      console.log(`Enemy ${enemyId}: Bat scene children:`, batScene.children.length);
      
      // Ensure materials are visible
      batScene.traverse((child) => {
        if (child instanceof Mesh) {
          console.log(`Enemy ${enemyId}: Found mesh:`, child.name, 'Material:', !!child.material);
          if (child.material) {
            child.material.visible = true;
          }
        }
      });
    }
  }, [batScene, enemyId]);

  // Initialize as enemy
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`Enemy ${enemyId} initializing as enemy at position:`, position);
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
        console.log(`Enemy ${enemyId} starting death fade - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`Enemy ${enemyId} death complete`);
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

    // AI movement - chase player
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Update position
    groupRef.current.position.copy(currentPosition.current);

    // Flying animation
    if (groupRef.current) {
      const time = Date.now() * 0.003;
      const bobOffset = Math.sin(time + position[0]) * 0.3;
      groupRef.current.position.y = currentPosition.current.y + bobOffset;
      
      // Face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
      
      // Flying motion
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    }

    // Check collision
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  // Fallback while loading
  if (!batScene) {
    console.log(`Enemy ${enemyId}: Bat model loading, showing fallback`);
    return (
      <group ref={groupRef} position={position}>
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
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
      {/* Health bar attached as child - follows bat exactly */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2.8, 0]} // Positioned above bat
        />
      )}
      
      {/* Vampire Bat Model - main enemy scale */}
      <primitive 
        object={batScene.clone()} 
        scale={[2.0, 2.0, 2.0]} // Larger than minions
        rotation={[0, Math.PI, 0]}
        position={[0, 0, 0]}
      />
      
      {/* Debug collision bounds */}
      <mesh visible={false}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshBasicMaterial wireframe color="#00ff00" />
      </mesh>
    </group>
  );
};

// Preload model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

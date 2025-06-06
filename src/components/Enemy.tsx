
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
  const batMeshRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(position[0], position[1] + 1.5, position[2])); // Start hovering at fixed height
  const speed = 2;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load vampire bat model
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  useEffect(() => {
    console.log(`Enemy ${enemyId}: Bat model loaded:`, !!batScene);
    if (batScene && batMeshRef.current) {
      console.log(`Enemy ${enemyId}: Bat scene children:`, batScene.children.length);
      
      // Clear any existing children and add the bat model
      batMeshRef.current.clear();
      const batClone = batScene.clone();
      
      // Ensure materials are visible and properly configured
      batClone.traverse((child) => {
        if (child instanceof Mesh) {
          console.log(`Enemy ${enemyId}: Found mesh:`, child.name, 'Material:', !!child.material);
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.visible = true;
            child.material.needsUpdate = true;
          }
        }
      });

      // Apply proper positioning - adjust for model pivot point
      batClone.position.set(0, 1.2, 0); // Offset to center the bat model properly
      batClone.scale.setScalar(1.2); // Main enemy scale
      batClone.rotation.set(0, Math.PI, 0); // Face forward
      
      // Parent the bat mesh to the enemy entity
      batMeshRef.current.add(batClone);
      console.log(`Enemy ${enemyId}: Bat model properly parented to enemy entity`);
    }
  }, [batScene, enemyId]);

  // Initialize as enemy with proper flight position
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      // Position main enemies at elevated flight position - fixed height
      const flightPosition: [number, number, number] = [position[0], 1.5, position[2]];
      console.log(`Enemy ${enemyId} initializing as enemy at flight position:`, flightPosition);
      onInitialize(enemyId, flightPosition);
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

    // AI movement - chase player at flight altitude
    const targetPosition = playerPosition.clone();
    targetPosition.y = 1.5; // Maintain fixed flight altitude
    
    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Ensure bat stays at proper height
    currentPosition.current.y = 1.5;

    // Update enemy entity position (this is what health bar should track)
    groupRef.current.position.copy(currentPosition.current);

    // Flying animation with proper hovering
    if (batMeshRef.current) {
      const time = Date.now() * 0.003;
      const bobOffset = Math.sin(time + position[0]) * 0.4;
      
      // Apply flight motion to the bat mesh within the enemy entity
      batMeshRef.current.position.y = bobOffset; // Relative to entity position
      
      // Face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      batMeshRef.current.rotation.y = angle;
      
      // Flying motion - enhanced for main enemies
      batMeshRef.current.rotation.z = Math.sin(time * 0.5) * 0.15;
      batMeshRef.current.rotation.x = Math.sin(time * 0.8) * 0.1;
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

  return (
    <group ref={groupRef} position={[position[0], 1.5, position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above enemy entity - tracks the enemy entity */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2.5, 0]} // Positioned above enemy entity
        />
      )}
      
      {/* Bat mesh container - properly parented to enemy entity */}
      <group ref={batMeshRef} />
      
      {/* Fallback while loading - also properly centered */}
      {!batScene && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        </group>
      )}
      
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

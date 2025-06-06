
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { Group, Vector3, Mesh } from 'three';
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
  const batMeshRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(position[0], position[1] + 1.5, position[2])); // Start hovering at proper height
  const speed = 2.5;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load vampire bat model and animations
  const { scene: batScene, animations } = useGLTF('/assets/vampire-bat/source/bat.glb');
  const { actions } = useAnimations(animations, batMeshRef);

  useEffect(() => {
    console.log(`BatMinion ${enemyId}: Model loading state - Scene:`, !!batScene);
    if (batScene && batMeshRef.current) {
      console.log(`BatMinion ${enemyId}: Bat model loaded successfully, children:`, batScene.children.length);
      
      // Clear any existing children and add the bat model
      batMeshRef.current.clear();
      const batClone = batScene.clone();
      
      // Fix materials and ensure proper setup
      batClone.traverse((child) => {
        if (child instanceof Mesh) {
          console.log(`BatMinion ${enemyId}: Found mesh:`, child.name, 'Visible:', child.visible);
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.visible = true;
            // Ensure material updates correctly
            child.material.needsUpdate = true;
          }
        }
      });

      // Apply proper positioning for minions - adjust for model pivot point
      batClone.position.set(0, 1.0, 0); // Slightly lower offset for minions
      batClone.scale.setScalar(0.8); // Smaller for minions
      batClone.rotation.set(0, Math.PI, 0); // Face forward
      
      // Parent the bat mesh to the enemy entity
      batMeshRef.current.add(batClone);
      console.log(`BatMinion ${enemyId}: Bat model properly parented to enemy entity`);
    } else {
      console.log(`BatMinion ${enemyId}: Bat model not yet loaded`);
    }
  }, [batScene, enemyId]);

  // Play the flying animation if available
  useEffect(() => {
    if (actions && actions['Fly']) {
      actions['Fly'].reset().play();
    }
  }, [actions]);

  // Initialize as enemy with proper flight position
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      // Position bats in flight position (elevated from ground) - fixed height
      const flightPosition: [number, number, number] = [position[0], 1.5, position[2]];
      console.log(`BatMinion ${enemyId} initializing as enemy at flight position:`, flightPosition);
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
      // Orbit around fairy at flight height
      const time = Date.now() * 0.002;
      const orbitRadius = 3;
      const orbitAngle = time + orbitalOffset;
      
      targetPosition = fairyPosition.clone();
      targetPosition.x += Math.cos(orbitAngle) * orbitRadius;
      targetPosition.z += Math.sin(orbitAngle) * orbitRadius;
      targetPosition.y = 1.5 + Math.sin(time * 3 + orbitalOffset) * 0.8; // Fixed hover height
    } else {
      // Maintain flight altitude when chasing player
      targetPosition.y = 1.5; // Fixed flight height
    }

    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Ensure bat stays at proper flight height
    currentPosition.current.y = Math.max(1.5, currentPosition.current.y);

    // Update enemy entity position (this is what health bar should track)
    groupRef.current.position.copy(currentPosition.current);

    // Enhanced flying animation with proper hovering
    if (batMeshRef.current) {
      const time = Date.now() * 0.005;
      const flyBob = Math.sin(time * 2 + orbitalOffset) * 0.4;
      const flyWobble = Math.cos(time * 3 + orbitalOffset) * 0.2;
      
      // Apply flight motion to the bat mesh within the enemy entity
      batMeshRef.current.position.y = flyBob; // Relative to entity position
      batMeshRef.current.position.x = flyWobble; // Relative to entity position
      
      // Face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      batMeshRef.current.rotation.y = angle;
      
      // Wing flapping animation
      batMeshRef.current.rotation.z = Math.sin(time * 8) * 0.2;
      batMeshRef.current.rotation.x = Math.sin(time * 6) * 0.1;
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

  return (
    <group ref={groupRef} position={[position[0], 1.5, position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above enemy entity - tracks the enemy entity */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2.0, 0]} // Positioned above enemy entity
        />
      )}
      
      {/* Bat mesh container - properly parented to enemy entity */}
      <group ref={batMeshRef} />
      
      {/* Fallback if model doesn't load - also properly centered */}
      {!batScene && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#990000" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.2, 0.6, 3]} />
            <meshStandardMaterial color="#660000" />
          </mesh>
        </group>
      )}
      
      {/* Debug collision bounds - visible during development */}
      <mesh visible={false}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial wireframe color="#660000" />
      </mesh>
    </group>
  );
};

// Preload model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

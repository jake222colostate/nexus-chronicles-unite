
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
  enemyType: string;
}

export const Enemy: React.FC<EnemyProps> = ({
  position = [0, 0, 0],
  playerPosition,
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId,
  enemyType
}) => {
  const groupRef = useRef<Group>(null);
  const batMeshRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(position[0], 1.5, position[2])); // Start at proper flight height
  const speed = 2;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load vampire bat model from local assets when needed
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  useEffect(() => {
    if (enemyType === 'vampire_bat' && batScene && batMeshRef.current) {
      console.log(`Enemy ${enemyId}: Bat model loaded successfully - children:`, batScene.children.length);
      
      // Clear any existing children and add the bat model
      batMeshRef.current.clear();
      const batClone = batScene.clone();
      
      // Ensure materials are visible and properly configured
      batClone.traverse((child) => {
        if (child instanceof Mesh) {
          console.log(`Enemy ${enemyId}: Configuring mesh:`, child.name, 'Material:', !!child.material);
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.visible = true;
            child.material.needsUpdate = true;
            // Ensure proper material transparency
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1.0;
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1.0;
            }
          }
        }
      });

      // Apply proper positioning and scaling for vampire bat
      batClone.position.set(0, 0, 0); // Center at entity position
      batClone.scale.setScalar(2.0); // Larger scale for better visibility
      batClone.rotation.set(0, Math.PI, 0); // Face forward initially
      
      // Parent the bat mesh to the enemy entity
      batMeshRef.current.add(batClone);
      console.log(`Enemy ${enemyId}: Bat model successfully added to enemy entity with 2.0x scale for visibility`);
    }
  }, [batScene, enemyId, enemyType]);

  // Initialize enemy in damage system
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      const flightPosition: [number, number, number] = [position[0], 1.5, position[2]];
      console.log(`Enemy ${enemyId}: Initializing at flight position:`, flightPosition);
      onInitialize(enemyId, flightPosition);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Handle death animation
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`Enemy ${enemyId}: Starting death animation - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`Enemy ${enemyId}: Death animation complete`);
      }
      return;
    }

    // Reset if enemy is revived (shouldn't happen but just in case)
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    // AI movement - chase player at consistent flight altitude
    const targetPosition = playerPosition.clone();
    targetPosition.y = 1.5; // Maintain consistent flight altitude
    
    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Lock Y position to flight altitude
    currentPosition.current.y = 1.5;

    // Update enemy entity position
    groupRef.current.position.copy(currentPosition.current);

    // Enhanced flying animation for vampire bat
    if (batMeshRef.current) {
      const time = Date.now() * 0.003;
      const bobOffset = Math.sin(time + position[0]) * 0.3;
      
      // Apply subtle hovering motion relative to entity position
      batMeshRef.current.position.y = bobOffset;
      
      // Face movement direction smoothly
      const angle = Math.atan2(direction.x, direction.z);
      batMeshRef.current.rotation.y = angle;
      
      // Wing flapping and banking motion
      batMeshRef.current.rotation.z = Math.sin(time * 6) * 0.2;
      batMeshRef.current.rotation.x = Math.sin(time * 4) * 0.1;
    }

    // Check collision with player
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead and fully faded
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={[position[0], 1.5, position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above enemy entity */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2.5, 0]}
        />
      )}
      
      {/* Bat mesh container */}
      <group ref={batMeshRef} />
      
      {/* Fallback geometry while bat model loads - make it more visible */}
      {enemyType === 'vampire_bat' && !batScene && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.0, 12, 12]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <coneGeometry args={[0.4, 1.0, 6]} />
            <meshStandardMaterial color="#4B0000" />
          </mesh>
        </group>
      )}
      
      {/* Debug collision bounds (invisible) */}
      <mesh visible={false}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshBasicMaterial wireframe color="#00ff00" />
      </mesh>
    </group>
  );
};

// Preload the vampire bat model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

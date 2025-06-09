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
  const currentPosition = useRef(new Vector3(position[0], 2.0, position[2])); // Higher flight altitude
  const speed = 2.5;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);
  const animationTime = useRef(0);

  // Load vampire bat model
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  useEffect(() => {
    if (enemyType === 'vampire_bat' && batScene && batMeshRef.current) {
      console.log(`Enemy ${enemyId}: Setting up vampire bat model with enhanced animations`);
      
      // Clear existing and add fresh bat model
      batMeshRef.current.clear();
      const batClone = batScene.clone();
      
      // Enhanced material setup for better visibility
      batClone.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.visible = true;
            child.material.needsUpdate = true;
            // Ensure solid materials for bat visibility
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.metalness = 0.2;
                mat.roughness = 0.8;
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1.0;
              if ('metalness' in child.material) child.material.metalness = 0.2;
              if ('roughness' in child.material) child.material.roughness = 0.8;
            }
          }
        }
      });

      // Scale and position for better visibility and animation
      batClone.position.set(0, 0, 0);
      batClone.scale.setScalar(2.5); // Larger for better visibility
      batClone.rotation.set(0, Math.PI, 0); // Face forward initially
      
      batMeshRef.current.add(batClone);
      console.log(`Enemy ${enemyId}: Vampire bat model configured with 2.5x scale and enhanced materials`);
    }
  }, [batScene, enemyId, enemyType]);

  // Initialize enemy in damage system
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      const flightPosition: [number, number, number] = [position[0], 2.0, position[2]];
      console.log(`Enemy ${enemyId}: Initializing vampire bat at flight position:`, flightPosition);
      onInitialize(enemyId, flightPosition);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Update animation time for consistent timing
    animationTime.current += delta;

    // Handle death animation with enhanced effects
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`Enemy ${enemyId}: Starting enhanced death animation - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 4); // Faster death fade
      groupRef.current.scale.setScalar(newScale);
      
      // Add spinning death effect
      if (batMeshRef.current) {
        batMeshRef.current.rotation.z += delta * 8; // Spin while dying
        batMeshRef.current.rotation.x += delta * 4;
      }
      
      if (newScale <= 0.05 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`Enemy ${enemyId}: Death animation complete`);
      }
      return;
    }

    // Reset if enemy is revived
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    // Enhanced AI movement - aggressive chase with proper flight altitude
    const targetPosition = playerPosition.clone();
    targetPosition.y = 2.0; // Maintain consistent flight altitude
    
    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Keep vampire bat at proper flight altitude
    currentPosition.current.y = 2.0;

    // Update entity position
    groupRef.current.position.copy(currentPosition.current);

    // Enhanced vampire bat flying animations
    if (batMeshRef.current && enemyType === 'vampire_bat') {
      const time = animationTime.current;
      const uniqueOffset = parseFloat(enemyId.split('_')[1]) || 0; // Use timestamp for unique offset
      
      // Complex hovering motion - figure-8 pattern
      const hoverRadius = 0.4;
      const hoverSpeed = 3.0;
      const bobHeight = 0.6;
      
      // Primary hovering motion
      const hoverX = Math.sin(time * hoverSpeed + uniqueOffset) * hoverRadius;
      const hoverY = Math.sin(time * hoverSpeed * 2 + uniqueOffset) * bobHeight;
      const hoverZ = Math.cos(time * hoverSpeed * 1.5 + uniqueOffset) * (hoverRadius * 0.5);
      
      batMeshRef.current.position.set(hoverX, hoverY, hoverZ);
      
      // Face movement direction smoothly
      const angle = Math.atan2(direction.x, direction.z);
      batMeshRef.current.rotation.y = angle;
      
      // Enhanced wing flapping animation - faster, more realistic
      const wingFlapSpeed = 12; // Very fast wing flapping
      const wingFlapIntensity = 0.4;
      batMeshRef.current.rotation.z = Math.sin(time * wingFlapSpeed + uniqueOffset) * wingFlapIntensity;
      
      // Banking motion during turns
      const bankingAngle = direction.x * 0.6; // Bank into turns
      batMeshRef.current.rotation.x = Math.sin(time * 4 + uniqueOffset) * 0.15 + bankingAngle;
      
      // Subtle body wobble for natural flight
      const wobbleY = Math.sin(time * 8 + uniqueOffset) * 0.1;
      batMeshRef.current.rotation.y += wobbleY;
    }

    // Check collision with player - closer contact needed
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 1.8 && onReachPlayer) {
      console.log(`Enemy ${enemyId}: Vampire bat reached player at distance ${distanceToPlayer}`);
      onReachPlayer();
    }
  });

  // Don't render if fully dead and faded
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={[position[0], 2.0, position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above flying bat */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 1.5, 0]} // Higher above the bat
        />
      )}
      
      {/* Enhanced bat mesh container with proper flight positioning */}
      <group ref={batMeshRef} />
      
      {/* Enhanced fallback geometry while bat model loads */}
      {enemyType === 'vampire_bat' && !batScene && (
        <group position={[0, 0, 0]}>
          {/* Main bat body */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 12, 12]} />
            <meshStandardMaterial color="#660000" metalness={0.2} roughness={0.8} />
          </mesh>
          {/* Bat wings */}
          <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI/6]}>
            <boxGeometry args={[0.1, 1.5, 0.8]} />
            <meshStandardMaterial color="#440000" />
          </mesh>
          <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI/6]}>
            <boxGeometry args={[0.1, 1.5, 0.8]} />
            <meshStandardMaterial color="#440000" />
          </mesh>
          {/* Bat head */}
          <mesh position={[0, 0.6, 0.2]}>
            <coneGeometry args={[0.3, 0.6, 6]} />
            <meshStandardMaterial color="#330000" />
          </mesh>
        </group>
      )}
      
      {/* Debug collision bounds (invisible in production) */}
      <mesh visible={false}>
        <sphereGeometry args={[1.8]} />
        <meshBasicMaterial wireframe color="#ff0000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

// Preload the vampire bat model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

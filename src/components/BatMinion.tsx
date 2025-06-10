
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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
  position = [0, 1.5, 0],
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
  const currentPosition = useRef(new Vector3(position[0], position[1], position[2]));
  const speed = 2.0;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);
  const spawnTime = useRef(Date.now());

  // Load vampire bat model from correct path
  const { scene: batScene } = useGLTF('/assets/vampire-bat/vampire-bat.glb');

  useEffect(() => {
    console.log(`BatMinion ${enemyId}: Loading vampire bat model from /assets/vampire-bat/vampire-bat.glb`);
    if (batScene && batMeshRef.current) {
      console.log(`BatMinion ${enemyId}: Vampire bat model loaded successfully, children:`, batScene.children.length);
      
      // Clear any existing children and add the bat model
      batMeshRef.current.clear();
      const batClone = batScene.clone();
      
      // Configure materials and shadows
      batClone.traverse((child) => {
        if (child instanceof Mesh) {
          console.log(`BatMinion ${enemyId}: Configuring mesh:`, child.name);
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

      // Apply proper positioning and scaling
      batClone.position.set(0, 0, 0);
      batClone.scale.setScalar(1.2); // Good visibility scale
      batClone.rotation.set(0, 0, 0); // Start facing forward
      
      batMeshRef.current.add(batClone);
      console.log(`BatMinion ${enemyId}: Vampire bat model configured and scaled`);
    }
  }, [batScene, enemyId]);

  // Initialize as enemy with proper flight position
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      const flightPosition: [number, number, number] = [position[0], 1.5, position[2]];
      console.log(`BatMinion ${enemyId} initializing at flight position:`, flightPosition);
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
        console.log(`BatMinion ${enemyId} starting death fade - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 4); // Faster death animation
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

    // Enhanced AI behavior - flying movement towards player
    let targetPosition = playerPosition.clone();
    targetPosition.y = 1.5; // Maintain flight height
    
    // Add some dynamic flight patterns
    const time = Date.now() * 0.001;
    const flightOffset = Math.sin(time + orbitalOffset) * 2; // Side-to-side flight pattern
    targetPosition.x += flightOffset;
    
    // Calculate direction to target
    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    // Apply movement
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Ensure bat maintains proper flight altitude with subtle bobbing
    const bobHeight = 1.5 + Math.sin(time * 3 + orbitalOffset) * 0.3;
    currentPosition.current.y = bobHeight;

    // Update enemy entity position
    groupRef.current.position.copy(currentPosition.current);

    // Enhanced flying animation for the bat mesh
    if (batMeshRef.current) {
      const fastTime = time * 2;
      
      // Flying bobbing motion
      const flyBob = Math.sin(fastTime * 4 + orbitalOffset) * 0.2;
      const flyWobble = Math.cos(fastTime * 3 + orbitalOffset) * 0.15;
      
      // Apply flight motion relative to entity
      batMeshRef.current.position.y = flyBob;
      batMeshRef.current.position.x = flyWobble;
      
      // Face movement direction smoothly
      const angle = Math.atan2(direction.x, direction.z);
      batMeshRef.current.rotation.y = angle;
      
      // Wing flapping and flight dynamics
      batMeshRef.current.rotation.z = Math.sin(fastTime * 10) * 0.3; // Wing flap
      batMeshRef.current.rotation.x = Math.sin(fastTime * 8) * 0.15; // Pitch variation
      
      // Banking during turns
      const turnSpeed = Math.abs(direction.x);
      batMeshRef.current.rotation.z += direction.x * turnSpeed * 0.5;
    }

    // Check collision with player
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2.0 && onReachPlayer) {
      console.log(`BatMinion ${enemyId} reached player at distance ${distanceToPlayer}`);
      onReachPlayer();
    }
  });

  // Don't render if dead and faded
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above bat */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 1.0, 0]}
        />
      )}
      
      {/* Bat mesh container with proper animation */}
      <group ref={batMeshRef} />
      
      {/* Enhanced fallback if model doesn't load */}
      {!batScene && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#660000" />
          </mesh>
          {/* Wing representations */}
          <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.8, 0.1, 0.4]} />
            <meshStandardMaterial color="#440000" />
          </mesh>
          <mesh position={[0.6, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.8, 0.1, 0.4]} />
            <meshStandardMaterial color="#440000" />
          </mesh>
        </group>
      )}
      
      {/* Debug collision bounds - invisible in production */}
      <mesh visible={false}>
        <sphereGeometry args={[2.0]} />
        <meshBasicMaterial wireframe color="#660000" />
      </mesh>
    </group>
  );
};

// Preload vampire bat model from correct path
useGLTF.preload('/assets/vampire-bat/vampire-bat.glb');

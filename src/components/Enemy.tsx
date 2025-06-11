
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { assetPath } from '../lib/assetPath';
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
  const modelRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(position[0], 0, position[2]));
  const speed = 1.5;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load the correct model based on enemy type
  const modelPath = enemyType === 'vampire_bat'
    ? assetPath('assets/vampire-bat/source/bat.glb')
    : assetPath('assets/monster_rig.glb');
    
  console.log(`Enemy ${enemyId}: Loading model from path: ${modelPath} for type: ${enemyType}`);
  const { scene: enemyScene } = useGLTF(modelPath);

  useEffect(() => {
    if (enemyScene && modelRef.current) {
      console.log(`Enemy ${enemyId}: Setting up ${enemyType} model`);
      
      // Clear existing and add new model
      modelRef.current.clear();
      const enemyClone = enemyScene.clone();
      
      // Setup materials
      enemyClone.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.visible = true;
            child.material.needsUpdate = true;
          }
        }
      });

      // Scale and position based on enemy type
      if (enemyType === 'vampire_bat') {
        enemyClone.position.set(0, 1, 0); // Flying height for bat
        enemyClone.scale.setScalar(0.3);
      } else {
        enemyClone.position.set(0, 0, 0); // Ground level for monster
        enemyClone.scale.setScalar(0.5);
      }
      
      enemyClone.rotation.set(0, 0, 0);
      modelRef.current.add(enemyClone);
      console.log(`Enemy ${enemyId}: ${enemyType} model configured successfully`);
    }
  }, [enemyScene, enemyId, enemyType]);

  // Initialize enemy in damage system
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      const enemyPosition: [number, number, number] = enemyType === 'vampire_bat' 
        ? [position[0], 1, position[2]] // Flying height
        : [position[0], 0, position[2]]; // Ground level
      console.log(`Enemy ${enemyId}: Initializing ${enemyType} at position:`, enemyPosition);
      onInitialize(enemyId, enemyPosition);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth, enemyType]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Handle death animation
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`Enemy ${enemyId}: Starting ${enemyType} death animation - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`Enemy ${enemyId}: ${enemyType} death animation complete`);
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

    // Movement based on enemy type
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);
    
    // Set appropriate height based on enemy type
    if (enemyType === 'vampire_bat') {
      currentPosition.current.y = 1; // Flying height
    } else {
      currentPosition.current.y = 0; // Ground level
    }

    // Update entity position
    groupRef.current.position.copy(currentPosition.current);

    // Rotation based on movement direction
    if (modelRef.current) {
      const angle = Math.atan2(direction.x, direction.z);
      modelRef.current.rotation.y = angle;
      
      // Add flying animation for bat
      if (enemyType === 'vampire_bat') {
        const time = Date.now() * 0.005;
        modelRef.current.rotation.x = Math.sin(time) * 0.1;
        modelRef.current.rotation.z = Math.sin(time * 0.8) * 0.05;
      }
    }

    // Check collision with player
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 1.5 && onReachPlayer) {
      console.log(`Enemy ${enemyId}: ${enemyType} reached player at distance ${distanceToPlayer}`);
      onReachPlayer();
    }
  });

  // Don't render if fully dead and faded
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  const heightOffset = enemyType === 'vampire_bat' ? 1 : 0;

  return (
    <group ref={groupRef} position={[position[0], heightOffset, position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above enemy */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2, 0]}
        />
      )}
      
      {/* Model container */}
      <group ref={modelRef} />
      
      {/* Fallback geometry if model doesn't load */}
      {!enemyScene && (
        <mesh>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color={enemyType === 'vampire_bat' ? "#444455" : "#553344"} />
        </mesh>
      )}
      
      {/* Debug collision bounds (invisible in production) */}
      <mesh visible={false}>
        <boxGeometry args={[1, 2, 1]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </group>
  );
};

// Preload both models
useGLTF.preload(assetPath('assets/vampire-bat/source/bat.glb'));
useGLTF.preload(assetPath('assets/monster_rig.glb'));

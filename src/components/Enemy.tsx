
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
  const modelRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(position[0], 0, position[2])); // Ground level for monster
  const speed = 1.5; // Slower speed for monster
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load monster model instead of bat
  const { scene: monsterScene } = useGLTF('/assets/monster_rig.glb');

  useEffect(() => {
    if (enemyType === 'vampire_bat' && monsterScene && modelRef.current) {
      console.log(`Enemy ${enemyId}: Setting up monster model (temporarily replacing bat)`);
      
      // Clear existing and add monster model
      modelRef.current.clear();
      const monsterClone = monsterScene.clone();
      
      // Setup materials
      monsterClone.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.visible = true;
            child.material.needsUpdate = true;
          }
        }
      });

      // Scale and position for monster
      monsterClone.position.set(0, 0, 0);
      monsterClone.scale.setScalar(0.5); // Smaller scale for monster
      monsterClone.rotation.set(0, 0, 0);
      
      modelRef.current.add(monsterClone);
      console.log(`Enemy ${enemyId}: Monster model configured as vampire bat replacement`);
    }
  }, [monsterScene, enemyId, enemyType]);

  // Initialize enemy in damage system
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      const groundPosition: [number, number, number] = [position[0], 0, position[2]];
      console.log(`Enemy ${enemyId}: Initializing monster at ground position:`, groundPosition);
      onInitialize(enemyId, groundPosition);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Handle death animation
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`Enemy ${enemyId}: Starting monster death animation - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`Enemy ${enemyId}: Monster death animation complete`);
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

    // Ground-based movement for monster
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);
    currentPosition.current.y = 0; // Keep on ground

    // Update entity position
    groupRef.current.position.copy(currentPosition.current);

    // Simple ground-based rotation for monster
    if (modelRef.current && enemyType === 'vampire_bat') {
      const angle = Math.atan2(direction.x, direction.z);
      modelRef.current.rotation.y = angle;
    }

    // Check collision with player
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 1.5 && onReachPlayer) {
      console.log(`Enemy ${enemyId}: Monster reached player at distance ${distanceToPlayer}`);
      onReachPlayer();
    }
  });

  // Don't render if fully dead and faded
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above monster */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2, 0]}
        />
      )}
      
      {/* Monster model container */}
      <group ref={modelRef} />
      
      {/* Fallback geometry if monster model doesn't load */}
      {enemyType === 'vampire_bat' && !monsterScene && (
        <mesh>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#553344" />
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

// Preload the monster model
useGLTF.preload('/assets/monster_rig.glb');

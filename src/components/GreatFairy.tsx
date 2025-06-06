
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, SkinnedMesh, Mesh } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface GreatFairyProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
  onSpawnMinions?: (fairyId: string, fairyPosition: [number, number, number]) => void;
}

export const GreatFairy: React.FC<GreatFairyProps> = ({ 
  position = [0, 0, 0],
  playerPosition, 
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId,
  onSpawnMinions
}) => {
  const groupRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 1.2;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);
  const minionsSpawned = useRef(false);

  // Load great fairy model
  const { scene: fairyScene } = useGLTF('/assets/great_fairy.glb');

  // Fix fairy model setup and T-pose
  useEffect(() => {
    console.log(`GreatFairy ${enemyId}: Model loaded:`, !!fairyScene);
    if (fairyScene) {
      console.log(`GreatFairy ${enemyId}: Scene children:`, fairyScene.children.length);
      
      // Fix T-pose and ensure proper materials
      fairyScene.traverse((child) => {
        if (child instanceof SkinnedMesh && child.skeleton) {
          console.log(`GreatFairy ${enemyId}: Found skeleton, fixing T-pose for bone count:`, child.skeleton.bones.length);
          
          // Fix T-pose by adjusting arm positions
          child.skeleton.bones.forEach((bone) => {
            const boneName = bone.name.toLowerCase();
            
            // Reset problematic arm bones to natural position
            if (boneName.includes('arm') || 
                boneName.includes('shoulder') ||
                boneName.includes('upperarm') ||
                boneName.includes('forearm')) {
              bone.rotation.set(0, 0, 0);
              bone.updateMatrixWorld(true);
            }
          });
        }
        
        // Ensure materials are visible - properly type check for Mesh
        if (child instanceof Mesh && child.material) {
          child.material.visible = true;
          child.material.needsUpdate = true;
        }
      });
    }
  }, [fairyScene, enemyId]);

  // Initialize enemy health
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`GreatFairy ${enemyId} initializing as enemy at position:`, position);
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  // Spawn minions when fairy spawns
  useEffect(() => {
    if (!minionsSpawned.current && onSpawnMinions && fairyScene && enemyHealth) {
      console.log(`GreatFairy ${enemyId}: Spawning bat minions`);
      onSpawnMinions(enemyId, position);
      minionsSpawned.current = true;
    }
  }, [onSpawnMinions, enemyId, position, fairyScene, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    // Handle death fade out
    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`GreatFairy ${enemyId} starting death fade - health: ${enemyHealth.currentHealth}`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`GreatFairy ${enemyId} death complete`);
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

    // Enemy AI - chase player
    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    // Keep fairy at ground level for proper enemy mechanics
    currentPosition.current.y = 0.5;

    // Update position
    groupRef.current.position.copy(currentPosition.current);

    // Gentle floating animation
    if (groupRef.current) {
      const time = Date.now() * 0.002;
      const floatBob = Math.sin(time + position[0]) * 0.2;
      groupRef.current.position.y = currentPosition.current.y + floatBob;
      
      // Face player direction
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
      
      // Gentle magical swaying
      groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.08;
    }

    // Check collision with player
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  // Fallback while model loads
  if (!fairyScene) {
    console.log(`GreatFairy ${enemyId}: Model loading, showing fallback`);
    return (
      <group ref={groupRef} position={position}>
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#ff69b4" />
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
      {/* Health bar positioned above fairy model */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 2.8, 0]} // Positioned above fairy head
        />
      )}
      
      {/* Great Fairy Model - PROPERLY SCALED TO PLAYER SIZE */}
      <primitive 
        object={fairyScene.clone()} 
        scale={[0.25, 0.25, 0.25]} // Much smaller - player-scale enemy
        rotation={[0, 0, 0]} 
        position={[0, 0, 0]} // Centered at group origin
      />
      
      {/* Debug collision bounds */}
      <mesh visible={false}>
        <boxGeometry args={[2, 3, 2]} />
        <meshBasicMaterial wireframe color="#ff69b4" />
      </mesh>
    </group>
  );
};

// Preload model
useGLTF.preload('/assets/great_fairy.glb');

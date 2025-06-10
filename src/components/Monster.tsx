
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Mesh } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface MonsterProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
}

export const Monster: React.FC<MonsterProps> = ({
  position = [0, 0, 0],
  playerPosition,
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId
}) => {
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(...position));
  const speed = 1.5;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  // Load monster model with error handling
  let monsterScene;
  try {
    const gltfData = useGLTF('/assets/monster_rig.glb');
    monsterScene = gltfData.scene;
    console.log(`Monster ${enemyId}: Model loaded successfully`);
  } catch (error) {
    console.error(`Monster ${enemyId}: Failed to load model:`, error);
    setModelError(true);
  }

  useEffect(() => {
    if (monsterScene && modelRef.current && !modelError) {
      try {
        console.log(`Monster ${enemyId}: Setting up model`);
        modelRef.current.clear();
        const clone = monsterScene.clone();
        
        clone.traverse(child => {
          if (child instanceof Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.visible = true;
              child.material.needsUpdate = true;
            }
          }
        });
        
        clone.scale.setScalar(0.5);
        clone.position.set(0, 0, 0);
        clone.rotation.set(0, 0, 0);
        
        modelRef.current.add(clone);
        setModelLoaded(true);
        console.log(`Monster ${enemyId}: Model setup complete`);
      } catch (error) {
        console.error(`Monster ${enemyId}: Error setting up model:`, error);
        setModelError(true);
        setModelLoaded(false);
      }
    } else if (!monsterScene && !modelError) {
      console.warn(`Monster ${enemyId}: Model scene not available`);
      setModelLoaded(false);
    }
  }, [monsterScene, enemyId, modelError]);

  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      console.log(`Monster ${enemyId}: Initializing at position:`, position);
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`Monster ${enemyId}: Starting death animation`);
      }
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
      }
      return;
    }

    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    const direction = new Vector3()
      .subVectors(playerPosition, currentPosition.current)
      .normalize();
    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);
    currentPosition.current.y = 0;
    groupRef.current.position.copy(currentPosition.current);

    if (modelRef.current && modelLoaded) {
      const angle = Math.atan2(direction.x, direction.z);
      modelRef.current.rotation.y = angle;
    }

    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 1.5 && onReachPlayer) {
      onReachPlayer();
    }
  });

  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} castShadow receiveShadow>
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar enemyHealth={enemyHealth} position={[0, 2, 0]} />
      )}
      
      {/* Model container */}
      <group ref={modelRef} />
      
      {/* Enhanced fallback when model fails to load */}
      {(!modelLoaded || modelError) && (
        <group>
          {/* Main body */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="#553344" />
          </mesh>
          {/* Arms */}
          <mesh position={[-0.7, 1, 0]}>
            <boxGeometry args={[0.3, 1.5, 0.3]} />
            <meshStandardMaterial color="#442233" />
          </mesh>
          <mesh position={[0.7, 1, 0]}>
            <boxGeometry args={[0.3, 1.5, 0.3]} />
            <meshStandardMaterial color="#442233" />
          </mesh>
          {/* Legs */}
          <mesh position={[-0.3, 0, 0]}>
            <boxGeometry args={[0.3, 1, 0.3]} />
            <meshStandardMaterial color="#331122" />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.3, 1, 0.3]} />
            <meshStandardMaterial color="#331122" />
          </mesh>
          {/* Head */}
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#664455" />
          </mesh>
        </group>
      )}
      
      <mesh visible={false}>
        <boxGeometry args={[1, 2, 1]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </group>
  );
};

// Preload with error handling
try {
  useGLTF.preload('/assets/monster_rig.glb');
} catch (error) {
  console.error('Failed to preload monster model:', error);
}

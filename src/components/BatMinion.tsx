
import React, { useRef, useEffect, useState } from 'react';
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
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  // Load vampire bat model with error handling
  let batScene;
  try {
    const gltfData = useGLTF('/assets/vampire-bat/source/bat.glb');
    batScene = gltfData.scene;
    console.log(`BatMinion ${enemyId}: Model loaded successfully`);
  } catch (error) {
    console.error(`BatMinion ${enemyId}: Failed to load model:`, error);
    setModelError(true);
  }

  useEffect(() => {
    if (batScene && batMeshRef.current && !modelError) {
      try {
        console.log(`BatMinion ${enemyId}: Setting up model`);
        batMeshRef.current.clear();
        const batClone = batScene.clone();
        
        batClone.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.visible = true;
              child.material.needsUpdate = true;
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

        batClone.position.set(0, 0, 0);
        batClone.scale.setScalar(2.0);
        batClone.rotation.set(0, 0, 0);
        
        batMeshRef.current.add(batClone);
        setModelLoaded(true);
        console.log(`BatMinion ${enemyId}: Model setup complete`);
      } catch (error) {
        console.error(`BatMinion ${enemyId}: Error setting up model:`, error);
        setModelError(true);
        setModelLoaded(false);
      }
    } else if (!batScene && !modelError) {
      console.warn(`BatMinion ${enemyId}: Model scene not available`);
      setModelLoaded(false);
    }
  }, [batScene, enemyId, modelError]);

  useEffect(() => {
    if (!initialized.current && onInitialize) {
      const flightPosition: [number, number, number] = [position[0], 1.5, position[2]];
      console.log(`BatMinion ${enemyId}: Initializing at position:`, flightPosition);
      onInitialize(enemyId, flightPosition);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPosition) return;

    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) {
        fadeOutStarted.current = true;
        console.log(`BatMinion ${enemyId}: Starting death animation`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 4);
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

    const targetPosition = playerPosition.clone();
    targetPosition.y = 1.5;
    
    const time = Date.now() * 0.001;
    const flightOffset = Math.sin(time + orbitalOffset) * 2;
    targetPosition.x += flightOffset;
    
    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);

    const bobHeight = 1.5 + Math.sin(time * 3 + orbitalOffset) * 0.3;
    currentPosition.current.y = bobHeight;

    groupRef.current.position.copy(currentPosition.current);

    if (batMeshRef.current && modelLoaded) {
      const fastTime = time * 2;
      const flyBob = Math.sin(fastTime * 4 + orbitalOffset) * 0.2;
      const flyWobble = Math.cos(fastTime * 3 + orbitalOffset) * 0.15;
      
      batMeshRef.current.position.y = flyBob;
      batMeshRef.current.position.x = flyWobble;
      
      const angle = Math.atan2(direction.x, direction.z);
      batMeshRef.current.rotation.y = angle;
      batMeshRef.current.rotation.z = Math.sin(fastTime * 10) * 0.3;
      batMeshRef.current.rotation.x = Math.sin(fastTime * 8) * 0.15;
      batMeshRef.current.rotation.z += direction.x * Math.abs(direction.x) * 0.5;
    }

    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2.0 && onReachPlayer) {
      onReachPlayer();
    }
  });

  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]} castShadow receiveShadow>
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 1.2, 0]}
        />
      )}
      
      <group ref={batMeshRef} />
      
      {/* Enhanced fallback when model fails to load */}
      {(!modelLoaded || modelError) && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#440000" />
          </mesh>
          <mesh position={[-0.6, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.8, 0.05, 0.4]} />
            <meshStandardMaterial color="#660000" />
          </mesh>
          <mesh position={[0.6, 0.1, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[0.8, 0.05, 0.4]} />
            <meshStandardMaterial color="#660000" />
          </mesh>
          <mesh position={[-0.1, 0.25, 0.1]}>
            <coneGeometry args={[0.08, 0.15]} />
            <meshStandardMaterial color="#330000" />
          </mesh>
          <mesh position={[0.1, 0.25, 0.1]}>
            <coneGeometry args={[0.08, 0.15]} />
            <meshStandardMaterial color="#330000" />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Preload with error handling
try {
  useGLTF.preload('/assets/vampire-bat/source/bat.glb');
} catch (error) {
  console.error('Failed to preload bat model:', error);
}

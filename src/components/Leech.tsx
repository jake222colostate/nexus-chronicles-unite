
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Mesh } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface LeechProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
}

export const Leech: React.FC<LeechProps> = ({
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
  const speed = 2.0; // Slightly faster than monsters
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Use the vampire bat model as a placeholder since leech.glb doesn't exist
  // This will be rendered differently with materials and scaling
  const { scene: leechScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  useEffect(() => {
    if (leechScene && modelRef.current) {
      modelRef.current.clear();
      const clone = leechScene.clone();
      clone.traverse(child => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Make it look more leech-like with darker colors
          if (child.material) {
            const material = child.material.clone();
            material.color.setHex(0x4a2c2a); // Dark brown leech color
            child.material = material;
          }
        }
      });
      // Scale and orient for leech-like appearance
      clone.scale.setScalar(0.3); // Smaller than bat
      clone.rotation.x = Math.PI / 2; // Rotate to make it more ground-oriented
      modelRef.current.add(clone);
    }
  }, [leechScene]);

  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      onInitialize(enemyId, position);
      initialized.current = true;
    }
  }, [enemyId, position, onInitialize, enemyHealth]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (enemyHealth && enemyHealth.currentHealth <= 0) {
      if (!fadeOutStarted.current) fadeOutStarted.current = true;
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
    currentPosition.current.y = 0.2; // Slightly above ground
    groupRef.current.position.copy(currentPosition.current);

    if (modelRef.current) {
      const angle = Math.atan2(direction.x, direction.z);
      modelRef.current.rotation.y = angle;
      
      // Add slithering motion
      const time = Date.now() * 0.008;
      modelRef.current.rotation.z = Math.sin(time) * 0.1;
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
        <EnemyHealthBar enemyHealth={enemyHealth} position={[0, 1.5, 0]} />
      )}
      <group ref={modelRef} />
      {/* Fallback geometry if model fails to load */}
      {!leechScene && (
        <mesh>
          <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
          <meshStandardMaterial color="#4a2c2a" />
        </mesh>
      )}
      <mesh visible={false}>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </group>
  );
};

// Preload the vampire bat model that we're using as a substitute
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

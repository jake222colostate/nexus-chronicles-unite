
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Mesh, SkinnedMesh } from 'three';
import { EnemyHealthBar } from './EnemyHealthBar';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface VampireBatProps {
  position: [number, number, number];
  playerPosition: Vector3;
  onReachPlayer?: () => void;
  enemyHealth?: EnemyHealth;
  onInitialize?: (id: string, position: [number, number, number]) => void;
  enemyId: string;
}

export const VampireBat: React.FC<VampireBatProps> = ({ 
  position = [0, 0, 0],
  playerPosition, 
  onReachPlayer,
  enemyHealth,
  onInitialize,
  enemyId
}) => {
  const groupRef = useRef<Group>(null);
  const batModelRef = useRef<Group>(null);
  const currentPosition = useRef(new Vector3(position[0], 2.5, position[2])); // Flight height
  const speed = 2;
  const initialized = useRef(false);
  const fadeOutStarted = useRef(false);
  const isFullyFaded = useRef(false);

  // Load vampire bat model from local assets
  const { scene: batScene } = useGLTF('/assets/vampire-bat/source/bat.glb');

  // Process and setup bat model
  const processedBatModel = useMemo(() => {
    if (!batScene) return null;

    const batClone = batScene.clone() as Group;
    
    console.log(`VampireBat ${enemyId}: Processing bat model with ${batClone.children.length} children`);
    
    // Process all meshes in the model
    batClone.traverse((child) => {
      if (child instanceof Mesh || child instanceof SkinnedMesh) {
        console.log(`VampireBat ${enemyId}: Processing mesh: ${child.name || 'unnamed'}`);
        
        // Ensure visibility
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Prevent culling issues
        
        // Fix materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat, index) => {
              console.log(`VampireBat ${enemyId}: Fixing material ${index}`);
              mat.visible = true;
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.needsUpdate = true;
            });
          } else {
            console.log(`VampireBat ${enemyId}: Fixing single material`);
            child.material.visible = true;
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.needsUpdate = true;
          }
        }
        
        // Fix geometry
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
      }
    });
    
    console.log(`VampireBat ${enemyId}: Processed bat model successfully`);
    return batClone;
  }, [batScene, enemyId]);

  // Setup bat model in the scene
  useEffect(() => {
    if (processedBatModel && batModelRef.current) {
      console.log(`VampireBat ${enemyId}: Adding processed model to scene`);
      
      // Clear existing children
      batModelRef.current.clear();
      
      // Add the processed bat model
      batModelRef.current.add(processedBatModel);
      
      // Apply proper scaling and positioning
      processedBatModel.position.set(0, 0, 0);
      processedBatModel.scale.setScalar(4.0); // Larger scale for better visibility
      processedBatModel.rotation.set(0, Math.PI, 0); // Face forward
      
      // Force visibility
      processedBatModel.visible = true;
      processedBatModel.frustumCulled = false;
      
      console.log(`VampireBat ${enemyId}: Bat model successfully added and scaled to 4.0x`);
    }
  }, [processedBatModel, enemyId]);

  // Initialize enemy in damage system
  useEffect(() => {
    if (!initialized.current && onInitialize && !enemyHealth) {
      const flightPosition: [number, number, number] = [position[0], 2.5, position[2]];
      console.log(`VampireBat ${enemyId}: Initializing at flight position:`, flightPosition);
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
        console.log(`VampireBat ${enemyId}: Starting death animation`);
      }
      
      const currentScale = groupRef.current.scale.x;
      const newScale = Math.max(0, currentScale - delta * 3);
      groupRef.current.scale.setScalar(newScale);
      
      if (newScale <= 0.1 && !isFullyFaded.current) {
        groupRef.current.visible = false;
        isFullyFaded.current = true;
        console.log(`VampireBat ${enemyId}: Death animation complete`);
      }
      return;
    }

    // Reset if revived
    if (enemyHealth && enemyHealth.currentHealth > 0 && fadeOutStarted.current) {
      fadeOutStarted.current = false;
      isFullyFaded.current = false;
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    }

    // AI movement - chase player at flight altitude
    const targetPosition = playerPosition.clone();
    targetPosition.y = 2.5; // Maintain flight altitude
    
    const direction = new Vector3()
      .subVectors(targetPosition, currentPosition.current)
      .normalize();

    const movement = direction.multiplyScalar(speed * delta);
    currentPosition.current.add(movement);
    currentPosition.current.y = 2.5; // Lock flight altitude

    // Update bat position
    groupRef.current.position.copy(currentPosition.current);

    // Enhanced flying animation
    if (batModelRef.current && processedBatModel) {
      const time = Date.now() * 0.003;
      
      // Hovering motion
      const bobOffset = Math.sin(time + position[0]) * 0.5;
      batModelRef.current.position.y = bobOffset;
      
      // Face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      batModelRef.current.rotation.y = angle;
      
      // Wing flapping simulation
      batModelRef.current.rotation.z = Math.sin(time * 10) * 0.4;
      batModelRef.current.rotation.x = Math.sin(time * 8) * 0.3;
      
      // Banking motion
      const bankAngle = direction.x * 0.5;
      batModelRef.current.rotation.z += bankAngle;
    }

    // Check collision with player
    const distanceToPlayer = currentPosition.current.distanceTo(playerPosition);
    if (distanceToPlayer < 2.5 && onReachPlayer) {
      onReachPlayer();
    }
  });

  // Don't render if dead and fully faded
  if (enemyHealth && enemyHealth.currentHealth <= 0 && isFullyFaded.current) {
    return null;
  }

  return (
    <group ref={groupRef} position={[position[0], 2.5, position[2]]} castShadow receiveShadow>
      {/* Health bar positioned above bat */}
      {enemyHealth && enemyHealth.currentHealth > 0 && (
        <EnemyHealthBar 
          enemyHealth={enemyHealth} 
          position={[0, 3.5, 0]}
        />
      )}
      
      {/* Bat model container */}
      <group ref={batModelRef} />
      
      {/* Enhanced fallback geometry while model loads */}
      {!processedBatModel && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
          <mesh position={[-1.8, 0, -0.5]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[2.0, 1.0]} />
            <meshStandardMaterial color="#4B0000" />
          </mesh>
          <mesh position={[1.8, 0, -0.5]} rotation={[0, 0, -Math.PI / 4]}>
            <planeGeometry args={[2.0, 1.0]} />
            <meshStandardMaterial color="#4B0000" />
          </mesh>
        </group>
      )}
      
      {/* Debug collision bounds */}
      <mesh visible={false}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshBasicMaterial wireframe color="#00ff00" />
      </mesh>
    </group>
  );
};

// Preload the vampire bat model
useGLTF.preload('/assets/vampire-bat/source/bat.glb');

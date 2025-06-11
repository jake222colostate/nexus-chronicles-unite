
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SwordWeaponSystemProps {
  damage: number;
  enemyPositions: THREE.Vector3[];
  onHitEnemy: (index: number, damage: number) => void;
}

export const SwordWeaponSystem: React.FC<SwordWeaponSystemProps> = ({
  damage,
  enemyPositions,
  onHitEnemy
}) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [isSwinging, setIsSwinging] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const swingProgress = useRef(0);
  
  // Try to load the sword model safely
  let gltfResult = null;
  let loadError = false;
  
  try {
    gltfResult = useGLTF('/assets/swordofkasdd.glb');
  } catch (error) {
    console.log('SwordWeaponSystem: Failed to load sword model:', error);
    loadError = true;
  }
  
  const scene = gltfResult?.scene || null;

  // Handle load error in useEffect to prevent re-render loops
  useEffect(() => {
    if (loadError) {
      setHasLoadError(true);
    }
  }, [loadError]);

  // Handle model setup in useEffect to prevent re-render loops
  useEffect(() => {
    if (scene) {
      console.log('SwordWeaponSystem: Setting up sword model');
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.visible = true;
          
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1.0;
              });
            } else {
              mesh.material.transparent = false;
              mesh.material.opacity = 1.0;
            }
          }
        }
      });
      setIsModelLoaded(true);
    } else if (!loadError) {
      // Only set error if we haven't already detected a load error
      setHasLoadError(true);
    }
  }, [scene, loadError]);

  // Handle swing on click
  useEffect(() => {
    const handleClick = () => {
      if (!isSwinging) {
        console.log('SwordWeaponSystem: Starting sword swing');
        setIsSwinging(true);
        swingProgress.current = 0;
      }
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isSwinging]);

  useFrame((_, delta) => {
    if (!groupRef.current || !camera) return;

    // SIMPLIFIED: Position sword in consistent first-person view
    const swordOffset = new THREE.Vector3(0.6, -0.4, -1.0); // Right, down, forward
    
    // Get camera's rotation matrix and apply offset
    const cameraDirection = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();
    
    camera.matrix.extractBasis(cameraRight, cameraUp, cameraDirection);
    
    const worldOffset = new THREE.Vector3()
      .addScaledVector(cameraRight, swordOffset.x)
      .addScaledVector(cameraUp, swordOffset.y)
      .addScaledVector(cameraDirection, -swordOffset.z); // Negative because camera looks down -Z
    
    const worldPosition = camera.position.clone().add(worldOffset);
    groupRef.current.position.copy(worldPosition);
    
    // SIMPLIFIED: Base rotation follows camera with fixed offset
    groupRef.current.rotation.copy(camera.rotation);
    groupRef.current.rotateY(-0.3); // Slight angle to the right
    groupRef.current.rotateX(-0.2); // Slight downward angle
    
    // Ensure visibility
    groupRef.current.visible = true;
    groupRef.current.scale.set(0.8, 0.8, 0.8);

    // Handle swing animation
    if (isSwinging) {
      const swingDuration = 0.4;
      swingProgress.current += delta;
      const t = Math.min(swingProgress.current / swingDuration, 1);
      
      // Simple swing animation
      const swingAngle = Math.sin(t * Math.PI) * 1.2;
      groupRef.current.rotateZ(swingAngle);
      
      // Check for enemy hits during swing
      if (t > 0.3 && t < 0.8) {
        enemyPositions.forEach((pos, idx) => {
          if (pos.distanceTo(camera.position) < 3) {
            console.log('SwordWeaponSystem: Hit enemy!');
            onHitEnemy(idx, damage);
          }
        });
      }
      
      // End swing
      if (t >= 1) {
        setIsSwinging(false);
        swingProgress.current = 0;
      }
    }
  });

  // Fallback sword if model fails to load
  if (!scene || hasLoadError || !isModelLoaded) {
    console.log('SwordWeaponSystem: Using fallback sword geometry');
    return (
      <group ref={groupRef}>
        {/* Blade */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.08, 1.0, 0.02]} />
          <meshStandardMaterial color="#E6E6FA" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Guard */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.25, 0.04, 0.04]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Handle */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>
    );
  }

  console.log('SwordWeaponSystem: Rendering loaded sword model');
  return (
    <group ref={groupRef}>
      <primitive 
        object={scene.clone()} 
        scale={[1.0, 1.0, 1.0]}
      />
    </group>
  );
};

useGLTF.preload('/assets/swordofkasdd.glb');

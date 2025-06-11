
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useGLTFWithCors } from '../lib/useGLTFWithCors';
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
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  // Load the sword model with correct path and error handling
  let scene = null;
  try {
    const gltf = useGLTFWithCors('/sword_uitlbiaga_mid.glb');
    scene = gltf.scene;
  } catch (error) {
    if (error instanceof Error) {
      setLoadError(error);
    }
  }

  // Debug logging
  useEffect(() => {
    console.log('SwordWeaponSystem: Loading sword model...');
    if (loadError) {
      console.error('SwordWeaponSystem: Error loading sword model:', loadError);
    }
    if (scene) {
      console.log('SwordWeaponSystem: Sword model loaded successfully:', scene);
    }
  }, [scene, loadError]);

  // Ensure the model casts and receives shadows and is visible
  useEffect(() => {
    if (scene) {
      console.log('SwordWeaponSystem: Setting up sword model visibility');
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.frustumCulled = false; // Prevent disappearing
          mesh.visible = true;
          
          // Ensure materials are visible
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.visible = true;
              });
            } else {
              mesh.material.transparent = false;
              mesh.material.opacity = 1.0;
              mesh.material.visible = true;
            }
          }
        }
      });
    }
  }, [scene]);

  const swingRef = useRef(false);
  const hitRef = useRef(false);
  const swingProgress = useRef(0);

  useEffect(() => {
    const handleClick = () => {
      if (!swingRef.current) {
        console.log('SwordWeaponSystem: Starting sword swing');
        swingRef.current = true;
        hitRef.current = false;
        swingProgress.current = 0;
      }
    };
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !camera) return;

    const cameraForward = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();

    camera.getWorldDirection(cameraForward);
    cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
    cameraUp.crossVectors(cameraForward, cameraRight).normalize();

    // First-person sword positioning - right side of screen
    const pos = camera.position.clone()
      .add(cameraRight.clone().multiplyScalar(0.8))   // Further to the right
      .add(cameraUp.clone().multiplyScalar(-0.6))     // Lower position
      .add(cameraForward.clone().multiplyScalar(0.8)); // Closer to camera
    groupRef.current.position.copy(pos);

    // First-person sword rotation - angled like being held
    groupRef.current.rotation.copy(camera.rotation);
    groupRef.current.rotateY(-Math.PI / 3);  // Angle towards center
    groupRef.current.rotateX(-Math.PI / 6);  // Slight downward tilt
    groupRef.current.rotateZ(Math.PI / 8);   // Natural holding angle

    if (swingRef.current) {
      const duration = 0.3;
      swingProgress.current += delta;
      const t = Math.min(swingProgress.current / duration, 1);
      
      // Swing animation - diagonal slash from right to left
      const swingAngle = Math.sin(t * Math.PI) * 0.8;
      groupRef.current.rotation.z += swingAngle * delta / duration;
      groupRef.current.rotation.x -= swingAngle * 0.5 * delta / duration;

      if (t > 0.2 && t < 0.7 && !hitRef.current) {
        enemyPositions.forEach((pos, idx) => {
          if (pos.distanceTo(camera.position) < 2) {
            onHitEnemy(idx, damage);
            hitRef.current = true;
          }
        });
      }

      if (t >= 1) {
        swingRef.current = false;
        swingProgress.current = 0;
      }
    }
  });

  // Enhanced fallback sword with better visibility
  if (!scene || loadError) {
    console.log('SwordWeaponSystem: Using fallback sword model');
    return (
      <group ref={groupRef}>
        {/* Blade */}
        <mesh position={[0, 0, 0]} scale={[0.1, 1, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Guard */}
        <mesh position={[0, -0.3, 0]} scale={[0.3, 0.05, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Handle */}
        <mesh position={[0, -0.4, 0]} scale={[0.15, 0.2, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
    );
  }

  console.log('SwordWeaponSystem: Rendering sword model');
  return (
    <group ref={groupRef}>
      <primitive 
        object={scene.clone()} 
        scale={[1.5, 1.5, 1.5]}  // Appropriate scale for first-person view
      />
    </group>
  );
};

useGLTF.preload('/sword_uitlbiaga_mid.glb');


import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Staff model URL from new Netlify deployment
const STAFF_MODEL_URL = 'https://stately-liger-80d127.netlify.app/mage_staff.glb';

interface MagicStaffWeaponSystemProps {
  upgradeLevel: number;
  visible?: boolean;
}

export const MagicStaffWeaponSystem: React.FC<MagicStaffWeaponSystemProps> = ({
  upgradeLevel,
  visible = true
}) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<THREE.Group>(null);

  // Load the staff model with error handling
  const gltfResult = useMemo(() => {
    try {
      return useGLTF(STAFF_MODEL_URL);
    } catch (error) {
      console.warn(`Failed to load staff model:`, error);
      return null;
    }
  }, []);

  // Optimized frame update with reduced frequency
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible && gltfResult?.scene) {
      // Position relative to camera for first-person view
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Fixed bottom-right staff positioning
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(-0.4))
        .add(cameraUp.clone().multiplyScalar(-0.3))
        .add(cameraForward.clone().multiplyScalar(0.6));
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Fixed rotation for right-hand grip
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(25 * Math.PI / 180);
      weaponGroupRef.current.rotateZ(-30 * Math.PI / 180);
    }
  });

  // Skip rendering if GLB failed to load or not visible
  if (!visible || !gltfResult?.scene) {
    return null;
  }

  // Clone and optimize the staff scene
  const clonedScene = useMemo(() => {
    const scene = gltfResult.scene.clone();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = false;
        // Optimize materials for better performance
        if (child.material && 'needsUpdate' in child.material) {
          child.material.needsUpdate = false;
        }
      }
    });
    return scene;
  }, [gltfResult.scene]);

  return (
    <group ref={weaponGroupRef}>
      <primitive 
        object={clonedScene} 
        scale={[0.75, 0.75, 0.75]}
      />
    </group>
  );
};

// Preload staff model for smooth loading
try {
  useGLTF.preload(STAFF_MODEL_URL);
} catch (error) {
  console.warn(`Failed to preload staff model:`, error);
}

// Clear unused staff model cache
export const clearStaffModelCache = () => {
  useGLTF.clear(STAFF_MODEL_URL);
};


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

  console.log(`MagicStaffWeaponSystem: Using new Netlify staff at upgrade level ${upgradeLevel}`);

  // Load the staff model with error handling
  let gltfResult;
  
  try {
    gltfResult = useGLTF(STAFF_MODEL_URL);
  } catch (error) {
    console.warn(`Failed to load staff model:`, error);
    gltfResult = null;
  }

  // Attach weapon to camera (first-person POV) with exact user specifications
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible) {
      // Position relative to camera for first-person view
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Exact right-hand staff positioning as specified: X = 0.45, Y = -0.3, Z = 0.6
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.45))   // Right-hand offset
        .add(cameraUp.clone().multiplyScalar(-0.3))       // Lower position
        .add(cameraForward.clone().multiplyScalar(0.6));  // Forward distance
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Exact rotation for right-hand grip: Y = -20°, Z = 30°
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-20 * Math.PI / 180);  // -20° Y rotation
      weaponGroupRef.current.rotateZ(30 * Math.PI / 180);   // 30° Z rotation
    }
  });

  // Log upgrade changes
  useEffect(() => {
    console.log(`Staff system active at upgrade level ${upgradeLevel} with new Netlify model`);
  }, [upgradeLevel]);

  // Skip rendering if GLB failed to load or not visible
  if (!visible || !gltfResult?.scene) {
    if (!gltfResult?.scene) {
      console.log(`GLB load failed for staff, skipping render`);
    }
    return null;
  }

  // Clone and optimize the staff scene
  const clonedScene = gltfResult.scene.clone();
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = false; // Staff doesn't need to receive shadows
    }
  });

  console.log(`Successfully rendering staff from new Netlify (position: X=0.45, Y=-0.3, Z=0.6, rotations: Y=-20°, Z=30°, scale: 0.7×)`);

  return (
    <group ref={weaponGroupRef}>
      <primitive 
        object={clonedScene} 
        scale={[0.7, 0.7, 0.7]} // Uniform 0.7× scale as specified
      />
    </group>
  );
};

// Preload staff model for smooth loading
console.log('Preloading new Netlify staff model...');
try {
  useGLTF.preload(STAFF_MODEL_URL);
  console.log(`Preloaded staff model from new Netlify:`, STAFF_MODEL_URL);
} catch (error) {
  console.warn(`Failed to preload staff model from new Netlify:`, error);
}

// Clear unused staff model cache
export const clearStaffModelCache = () => {
  useGLTF.clear(STAFF_MODEL_URL);
  console.log('Cleared staff model cache for memory optimization');
};

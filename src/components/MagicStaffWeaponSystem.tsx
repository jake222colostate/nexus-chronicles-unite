
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Wizard staff model URLs from new Netlify deployment
const STAFF_MODELS = {
  base: 'https://bucolic-crostata-18dca7.netlify.app/mage_staff.glb',
  upgrade1: 'https://bucolic-crostata-18dca7.netlify.app/magical_staff.glb',
  upgrade2: 'https://bucolic-crostata-18dca7.netlify.app/stylized_magic_staff_of_water_game_ready.glb'
} as const;

interface MagicStaffWeaponSystemProps {
  upgradeLevel: number; // 0 = base, 1 = upgrade1, 2 = upgrade2
  visible?: boolean;
}

export const MagicStaffWeaponSystem: React.FC<MagicStaffWeaponSystemProps> = ({
  upgradeLevel,
  visible = true
}) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<THREE.Group>(null);

  // Determine current staff type based on upgrade level
  const currentStaffType = useMemo(() => {
    const safeUpgradeLevel = Math.max(0, upgradeLevel);
    if (safeUpgradeLevel >= 2) return 'upgrade2';
    if (safeUpgradeLevel >= 1) return 'upgrade1';
    return 'base';
  }, [upgradeLevel]);

  console.log(`MagicStaffWeaponSystem: Current upgrade level ${upgradeLevel}, using ${currentStaffType} staff`);

  // Load the appropriate staff model with error handling - no fallback
  const modelUrl = STAFF_MODELS[currentStaffType];
  let gltfResult;
  
  try {
    gltfResult = useGLTF(modelUrl);
  } catch (error) {
    console.warn(`Failed to load staff model ${currentStaffType}:`, error);
    gltfResult = null;
  }

  // Attach weapon to camera (first-person POV) with right-hand positioning
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible) {
      // Position relative to camera for first-person view
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // RIGHT-HAND staff positioning: X = 0.5 (more right), Y = -0.3 (slightly up), Z = 0.6 (closer)
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.5))   // Right-hand offset (increased)
        .add(cameraUp.clone().multiplyScalar(-0.3))      // Slightly up from previous position
        .add(cameraForward.clone().multiplyScalar(0.6)); // Closer to camera
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Rotate for right-hand grip - more natural right-hand angle
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-Math.PI / 8);  // Slight left rotation for right hand
      weaponGroupRef.current.rotateX(-Math.PI / 16); // Slight downward tilt
      weaponGroupRef.current.rotateZ(Math.PI / 12);  // Slight roll for natural grip
    }
  });

  // Log upgrade changes
  useEffect(() => {
    console.log(`Staff upgraded to: ${currentStaffType} (level ${upgradeLevel})`);
  }, [currentStaffType, upgradeLevel]);

  // Skip rendering if GLB failed to load or not visible - no fallback rendering
  if (!visible || !gltfResult?.scene) {
    if (!gltfResult?.scene) {
      console.log(`GLB load failed for ${currentStaffType} staff, skipping render - no fallback`);
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

  console.log(`Successfully rendering ${currentStaffType} staff from new Netlify (right-hand position)`);

  return (
    <group ref={weaponGroupRef}>
      <primitive 
        object={clonedScene} 
        scale={[1.2, 1.2, 1.2]} // Slightly larger for visibility
      />
    </group>
  );
};

// Preload all staff models for smooth upgrades
console.log('Preloading new Netlify wizard staff models...');
Object.entries(STAFF_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded ${type} staff model from new Netlify:`, url);
  } catch (error) {
    console.warn(`Failed to preload ${type} staff model from new Netlify:`, error);
  }
});

// Clear unused staff model cache
export const clearStaffModelCache = () => {
  Object.values(STAFF_MODELS).forEach(url => {
    useGLTF.clear(url);
  });
  console.log('Cleared staff model cache for memory optimization');
};

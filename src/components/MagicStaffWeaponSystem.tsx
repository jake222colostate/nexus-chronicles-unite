
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Staff model URL from updated Netlify deployment
const STAFF_MODEL_URL = 'https://6840b83a5870760bb84980de--stately-liger-80d127.netlify.app/mage_staff.glb';

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

  // Load the staff model with error handling and async loading
  const gltfResult = useMemo(() => {
    try {
      return useGLTF(STAFF_MODEL_URL);
    } catch (error) {
      console.warn(`Failed to load staff model:`, error);
      return null;
    }
  }, []);

  // First-person weapon positioning for bottom right corner view
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible && gltfResult?.scene) {
      // Get camera vectors for positioning
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Right-hand positioning for bottom right corner display
      // Position: X = 0.55 (right side), Y = -0.25 (down), Z = 0.55 (forward)
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.55))    // X = 0.55 (moves to right side)
        .add(cameraUp.clone().multiplyScalar(-0.25))       // Y = -0.25 (down for bottom corner)
        .add(cameraForward.clone().multiplyScalar(0.55));  // Z = 0.55 (forward)
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // First-person weapon rotation for angled view toward center
      // Rotation: Y = -30°, Z = 15° (angled toward screen center)
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-30 * Math.PI / 180); // Y = -30° (turn inward)
      weaponGroupRef.current.rotateZ(15 * Math.PI / 180);  // Z = 15° (slight tilt)
    }
  });

  // Skip rendering if GLB failed to load or not visible
  if (!visible || !gltfResult?.scene) {
    return null;
  }

  // Clone and optimize the staff scene with enhanced visibility
  const clonedScene = useMemo(() => {
    const scene = gltfResult.scene.clone();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = false;
        child.frustumCulled = false; // Prevent first-person culling issues
        
        // Enhanced material processing for weapon visibility
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.side = THREE.DoubleSide;
              mat.needsUpdate = true;
            });
          } else {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      }
    });
    return scene;
  }, [gltfResult.scene]);

  return (
    <group ref={weaponGroupRef}>
      <primitive 
        object={clonedScene} 
        scale={[0.55, 0.55, 0.55]}
      />
    </group>
  );
};

// Asynchronously preload staff model for smooth loading
try {
  useGLTF.preload(STAFF_MODEL_URL);
  console.log(`Preloading staff model: ${STAFF_MODEL_URL}`);
} catch (error) {
  console.warn(`Failed to preload staff model:`, error);
}

// Clear unused staff model cache
export const clearStaffModelCache = () => {
  useGLTF.clear(STAFF_MODEL_URL);
};

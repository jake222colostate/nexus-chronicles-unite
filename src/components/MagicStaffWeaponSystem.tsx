
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Staff model URLs from Netlify deployment with three upgrade levels
const STAFF_MODELS = {
  default: 'https://stately-liger-80d127.netlify.app/mage_staff.glb',
  upgrade: 'https://stately-liger-80d127.netlify.app/magical_staff.glb',
  final: 'https://stately-liger-80d127.netlify.app/stylized_magic_staff_of_water_game_ready.glb'
} as const;

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

  // Determine which staff model to use based on upgrade level
  const currentStaffModel = useMemo(() => {
    if (upgradeLevel >= 2) return STAFF_MODELS.final;
    if (upgradeLevel >= 1) return STAFF_MODELS.upgrade;
    return STAFF_MODELS.default;
  }, [upgradeLevel]);

  // Load the current staff model with error handling
  const gltfResult = useMemo(() => {
    try {
      return useGLTF(currentStaffModel);
    } catch (error) {
      console.warn(`Failed to load staff model:`, error);
      return null;
    }
  }, [currentStaffModel]);

  // Fixed staff positioning for right-hand view with your exact specifications
  useFrame(() => {
    if (weaponGroupRef.current && camera && visible && gltfResult?.scene) {
      // Get camera vectors for positioning
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Your exact positioning specifications:
      // Position: X = 0.35, Y = -0.25, Z = 0.55
      const staffPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.35))    // X = 0.35 (right)
        .add(cameraUp.clone().multiplyScalar(-0.25))       // Y = -0.25 (down)
        .add(cameraForward.clone().multiplyScalar(0.55));  // Z = 0.55 (forward)
      
      weaponGroupRef.current.position.copy(staffPosition);
      
      // Your exact rotation specifications:
      // Rotation Y: -35°, Rotation Z: 25°
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-35 * Math.PI / 180); // Y = -35°
      weaponGroupRef.current.rotateZ(25 * Math.PI / 180);  // Z = 25°
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
        scale={[0.55, 0.55, 0.55]}
      />
    </group>
  );
};

// Preload all staff models for smooth loading
Object.values(STAFF_MODELS).forEach(url => {
  try {
    useGLTF.preload(url);
  } catch (error) {
    console.warn(`Failed to preload staff model:`, error);
  }
});

// Clear unused staff model cache
export const clearStaffModelCache = () => {
  Object.values(STAFF_MODELS).forEach(url => {
    useGLTF.clear(url);
  });
};

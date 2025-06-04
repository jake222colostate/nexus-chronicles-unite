
import React, { useMemo, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Updated staff model URLs from your specifications
const STAFF_MODELS = {
  base: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/staffs/mage_staff.glb',
  upgrade1: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/staffs/magical_staff.glb',
  upgrade2: 'https://raw.githubusercontent.com/jake222colostate/nexus-chronicles-unite/main/staffs/stylized_magic_staff_of_water_game_ready.glb'
} as const;

interface MagicStaffWeaponSystemProps {
  upgradeLevel: number; // 0 = base, 1 = upgrade1, 2 = upgrade2
  visible?: boolean;
}

// Individual staff component
const StaffInstance: React.FC<{
  modelUrl: string;
  staffType: 'base' | 'upgrade1' | 'upgrade2';
  visible: boolean;
}> = ({ modelUrl, staffType, visible }) => {
  const staffRef = useRef<THREE.Group>(null);
  
  try {
    const { scene } = useGLTF(modelUrl);
    
    if (!scene) {
      console.log(`Staff model not loaded for ${staffType}, skipping`);
      return null;
    }

    console.log(`Successfully loaded ${staffType} staff`);
    
    // Clone the scene to create unique instance
    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      
      // Preserve original materials and textures
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Preserve original materials - don't modify
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
      
      return clone;
    }, [scene]);

    // Final positioning: X = 0.3, Y = -0.4, Z = 0.8 relative to camera
    const position: [number, number, number] = [0.3, -0.4, 0.8];
    
    // Rotate to aim diagonally forward in natural grip pose
    const rotation: [number, number, number] = [0.1, Math.PI / 8, 0.1];

    return (
      <group 
        ref={staffRef}
        visible={visible}
        position={position}
        rotation={rotation}
        scale={[1.0, 1.0, 1.0]}
      >
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    console.log(`Failed to load staff model for ${staffType}, skipping:`, error);
    return null;
  }
};

export const MagicStaffWeaponSystem: React.FC<MagicStaffWeaponSystemProps> = ({
  upgradeLevel,
  visible = true
}) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<THREE.Group>(null);

  // Determine current staff type based on upgrade level (ensure minimum 0)
  const currentStaffType = useMemo(() => {
    const safeUpgradeLevel = Math.max(0, upgradeLevel); // Ensure no negative values
    if (safeUpgradeLevel >= 2) return 'upgrade2';
    if (safeUpgradeLevel >= 1) return 'upgrade1';
    return 'base';
  }, [upgradeLevel]);

  console.log(`MagicStaffWeaponSystem: Current upgrade level ${upgradeLevel}, using ${currentStaffType} staff`);

  // Attach weapon to camera (first-person POV)
  useFrame(() => {
    if (weaponGroupRef.current && camera) {
      // Position the weapon group relative to the camera for first-person view
      weaponGroupRef.current.position.copy(camera.position);
      weaponGroupRef.current.rotation.copy(camera.rotation);
    }
  });

  // Log upgrade changes
  useEffect(() => {
    console.log(`Staff upgraded to: ${currentStaffType} (level ${upgradeLevel})`);
  }, [currentStaffType, upgradeLevel]);

  if (!visible) {
    return null;
  }

  return (
    <group ref={weaponGroupRef} name="MagicStaffWeaponSystem">
      {/* Render all staff models but only show the current one */}
      <StaffInstance
        modelUrl={STAFF_MODELS.base}
        staffType="base"
        visible={currentStaffType === 'base'}
      />
      <StaffInstance
        modelUrl={STAFF_MODELS.upgrade1}
        staffType="upgrade1"
        visible={currentStaffType === 'upgrade1'}
      />
      <StaffInstance
        modelUrl={STAFF_MODELS.upgrade2}
        staffType="upgrade2"
        visible={currentStaffType === 'upgrade2'}
      />
    </group>
  );
};

// Preload all staff models for seamless swapping
console.log('Preloading magic staff models...');
Object.entries(STAFF_MODELS).forEach(([type, url]) => {
  try {
    useGLTF.preload(url);
    console.log(`Preloaded ${type} staff model from:`, url);
  } catch (error) {
    console.log(`Failed to preload ${type} staff model:`, error);
  }
});

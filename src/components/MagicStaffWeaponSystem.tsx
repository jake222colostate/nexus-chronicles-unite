
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

  // Don't render anything for now since we removed the .glb files
  return null;
};

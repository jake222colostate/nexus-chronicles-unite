import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface WizardStaffProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  [key: string]: any;
}

// This component is now deprecated in favor of MagicStaffWeaponSystem
// Keeping for backward compatibility but will be hidden by default
export const WizardStaff: React.FC<WizardStaffProps> = React.memo((props) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');
  
  // Extract only explicitly allowed Three.js props
  const { 
    position, 
    rotation, 
    scale, 
    visible = false, // Hidden by default since we now use MagicStaffWeaponSystem
    castShadow, 
    receiveShadow,
    ...otherProps 
  } = props;
  
  // Only pass explicitly known Three.js properties
  const validThreeProps = useMemo(() => {
    const allowed: any = {};
    
    // Only include properties that Three.js Object3D actually supports
    if (visible !== undefined) allowed.visible = visible;
    if (castShadow !== undefined) allowed.castShadow = castShadow;
    if (receiveShadow !== undefined) allowed.receiveShadow = receiveShadow;
    
    return allowed;
  }, [visible, castShadow, receiveShadow]);
  
  // Memoize the cloned scene to prevent unnecessary re-cloning
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Optimize the scene only once
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = visible || false;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimize material if needed
        if (child.material) {
          child.material.needsUpdate = false;
        }
      }
    });
    
    return clone;
  }, [scene, visible]);

  // Simplified debug logging - only run once
  useEffect(() => {
    console.log('WizardStaff component (deprecated) - use MagicStaffWeaponSystem instead');
  }, []);

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <primitive 
      object={clonedScene} 
      position={position || [0.5, -1.0, -0.8]} 
      rotation={rotation || [0.1, Math.PI / 6, 0.1]}
      scale={scale || [1.0, 1.0, 1.0]}
      {...validThreeProps}
    />
  );
});

WizardStaff.displayName = 'WizardStaff';

// Preload the model for better performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');


import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface WizardStaffProps {
  [key: string]: any;
}

export const WizardStaff: React.FC<WizardStaffProps> = React.memo((props) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');
  
  // Memoize the cloned scene to prevent unnecessary re-cloning
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Optimize the scene only once
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimize material if needed
        if (child.material) {
          child.material.needsUpdate = false;
        }
      }
    });
    
    return clone;
  }, [scene]);

  // Simplified debug logging - only run once
  useEffect(() => {
    console.log('WizardStaff optimized and ready');
  }, []);

  return (
    <primitive 
      object={clonedScene} 
      {...props} 
      position={[0.5, -1.0, -0.8]} 
      rotation={[0.1, Math.PI / 6, 0.1]}
      scale={[1.0, 1.0, 1.0]}
    />
  );
});

WizardStaff.displayName = 'WizardStaff';

// Preload the model for better performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');

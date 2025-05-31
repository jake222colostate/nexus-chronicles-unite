
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

export const WizardStaff: React.FC<WizardStaffProps> = React.memo((props) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');
  
  // Extract only explicitly allowed Three.js props
  const { 
    position, 
    rotation, 
    scale, 
    visible, 
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
    
    // Ensure the staff is visible and properly lit
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true;
        child.castShadow = false; // Disable shadows for HUD element
        child.receiveShadow = false;
        
        // Ensure materials are visible
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.transparent = false;
              mat.opacity = 1;
              // Add emissive light to make it more visible
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
                mat.emissive = new THREE.Color(0x222222);
              }
            });
          } else {
            child.material.transparent = false;
            child.material.opacity = 1;
            // Add emissive light to make it more visible
            if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshLambertMaterial) {
              child.material.emissive = new THREE.Color(0x222222);
            }
          }
        }
      }
    });
    
    return clone;
  }, [scene]);

  // Debug logging
  useEffect(() => {
    console.log('WizardStaff: Model loaded and positioned at:', position || [0.8, -0.8, -1.2]);
    console.log('WizardStaff: Scene children count:', clonedScene.children.length);
  }, [clonedScene, position]);

  return (
    <group>
      {/* Add a local light to ensure the staff is well-lit */}
      <pointLight 
        position={[0.5, 0, 0]} 
        intensity={0.8} 
        color="#ffffff"
        distance={3}
      />
      
      <primitive 
        object={clonedScene} 
        position={position || [0.8, -0.8, -1.2]} 
        rotation={rotation || [0.2, Math.PI / 4, 0.1]}
        scale={scale || [0.8, 0.8, 0.8]}
        {...validThreeProps}
      />
    </group>
  );
});

WizardStaff.displayName = 'WizardStaff';

// Preload the model for better performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');

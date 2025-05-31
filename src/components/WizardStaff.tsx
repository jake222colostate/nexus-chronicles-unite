
import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface WizardStaffProps {
  [key: string]: any;
}

export const WizardStaff: React.FC<WizardStaffProps> = (props) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');
  
  // Enhanced debug logging with proper type checking
  React.useEffect(() => {
    console.log('WizardStaff scene loaded:', scene);
    console.log('Scene children count:', scene.children.length);
    
    if (scene.children.length > 0) {
      scene.children.forEach((child, index) => {
        console.log(`Child ${index}:`, child);
        console.log(`Child ${index} type:`, child.type);
        
        // Only log geometry and material for Mesh objects
        if (child instanceof THREE.Mesh) {
          console.log(`Child ${index} geometry:`, child.geometry);
          console.log(`Child ${index} material:`, child.material);
        }
        
        console.log(`Child ${index} visible:`, child.visible);
      });
    }
    
    // Make sure all children are visible
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        console.log('Making mesh visible:', child);
      }
    });
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      {...props} 
      position={[0.5, -1.0, -0.8]} 
      rotation={[0.1, Math.PI / 6, 0.1]}
      scale={[1.0, 1.0, 1.0]}
    />
  );
};

// Preload the model for better performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');

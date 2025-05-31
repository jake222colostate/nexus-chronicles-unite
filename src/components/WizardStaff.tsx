
import React from 'react';
import { useGLTF } from '@react-three/drei';

interface WizardStaffProps {
  [key: string]: any;
}

export const WizardStaff: React.FC<WizardStaffProps> = (props) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');
  
  // Debug logging
  React.useEffect(() => {
    console.log('WizardStaff scene loaded:', scene);
    console.log('Scene children:', scene.children);
    if (scene.children.length > 0) {
      console.log('First child:', scene.children[0]);
    }
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      {...props} 
      position={[0.3, -0.8, -1.0]} 
      rotation={[0, Math.PI / 8, Math.PI / 12]}
      scale={[0.6, 0.6, 0.6]}
    />
  );
};

// Preload the model for better performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');

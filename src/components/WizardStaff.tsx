
import React from 'react';
import { useGLTF } from '@react-three/drei';

interface WizardStaffProps {
  [key: string]: any;
}

export const WizardStaff: React.FC<WizardStaffProps> = (props) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');
  
  return (
    <primitive 
      object={scene} 
      {...props} 
      position={[0.4, -1.2, -1.5]} 
      rotation={[0, Math.PI / 6, 0]}
      scale={[0.4, 0.4, 0.4]}
    />
  );
};

// Preload the model for better performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');

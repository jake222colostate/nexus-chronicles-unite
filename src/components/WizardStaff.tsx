
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
      scale={[0.4, 0.4, 0.4]} 
      position={[0.5, -1.2, -1.5]}
      rotation={[0, 0, 0]}
    />
  );
};

// Preload the model for better performance
useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/weapons_enemies/main/wizard_staff.glb');

import React from 'react';
import { Plane, Box } from '@react-three/drei';
import { useMapEditorStore } from '../../stores/useMapEditorStore';

export const MapEditorEnvironment: React.FC = () => {
  const { isEditorActive } = useMapEditorStore();

  if (!isEditorActive) return null;

  return (
    <group>
      {/* Background color - lighter to avoid dark screen */}
      <color attach="background" args={['#4c566a']} />
      
      {/* Ground plane */}
      <Plane 
        args={[100, 100]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#888888" />
      </Plane>
      
      {/* Central reference point */}
      <Box args={[2, 0.2, 2]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#4a90e2" />
      </Box>
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
    </group>
  );
};

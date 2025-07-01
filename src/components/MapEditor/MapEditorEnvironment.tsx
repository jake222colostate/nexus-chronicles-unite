import React from 'react';
import { Plane, Box } from '@react-three/drei';
import { useMapEditorStore } from '../../stores/useMapEditorStore';

export const MapEditorEnvironment: React.FC = () => {
  const { isEditorActive } = useMapEditorStore();

  console.log('MapEditorEnvironment: isEditorActive =', isEditorActive);

  if (!isEditorActive) return null;

  console.log('MapEditorEnvironment: Rendering map editor environment');

  return (
    <group>
      {/* Ground plane */}
      <Plane 
        args={[200, 200]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshLambertMaterial color="#4a5568" />
      </Plane>
      
      {/* Some reference objects for scale */}
      <Box args={[2, 0.1, 2]} position={[0, 0.05, 0]}>
        <meshLambertMaterial color="#68d391" transparent opacity={0.3} />
      </Box>
      
      <Box args={[0.5, 1, 0.5]} position={[5, 0.5, 5]}>
        <meshLambertMaterial color="#f56565" />
      </Box>
      
      <Box args={[0.5, 1, 0.5]} position={[-5, 0.5, -5]}>
        <meshLambertMaterial color="#4299e1" />
      </Box>
      
      <Box args={[0.5, 1, 0.5]} position={[5, 0.5, -5]}>
        <meshLambertMaterial color="#ed8936" />
      </Box>
      
      <Box args={[0.5, 1, 0.5]} position={[-5, 0.5, 5]}>
        <meshLambertMaterial color="#9f7aea" />
      </Box>
      
      {/* Ambient lighting for map editor */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
};
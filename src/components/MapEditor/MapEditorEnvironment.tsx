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
      {/* Background color */}
      <color attach="background" args={['#1a1a2e']} />
      
      {/* Ground plane - much brighter and more visible */}
      <Plane 
        args={[200, 200]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#2d4a2d" />
      </Plane>
      
      {/* Central reference point - bright and visible */}
      <Box args={[2, 0.2, 2]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#00ff00" emissive="#004400" />
      </Box>
      
      {/* Corner markers - much brighter */}
      <Box args={[1, 2, 1]} position={[10, 1, 10]}>
        <meshStandardMaterial color="#ff0000" emissive="#440000" />
      </Box>
      
      <Box args={[1, 2, 1]} position={[-10, 1, -10]}>
        <meshStandardMaterial color="#0000ff" emissive="#000044" />
      </Box>
      
      <Box args={[1, 2, 1]} position={[10, 1, -10]}>
        <meshStandardMaterial color="#ffff00" emissive="#444400" />
      </Box>
      
      <Box args={[1, 2, 1]} position={[-10, 1, 10]}>
        <meshStandardMaterial color="#ff00ff" emissive="#440044" />
      </Box>
      
      {/* Much brighter lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Additional point light for better visibility */}
      <pointLight position={[0, 10, 0]} intensity={0.5} />
    </group>
  );
};
import React from 'react';
import { Plane, Box } from '@react-three/drei';
import { useMapEditorStore } from '../../stores/useMapEditorStore';

export const MapEditorEnvironment: React.FC = () => {
  const { isEditorActive } = useMapEditorStore();

  if (!isEditorActive) return null;

  return (
    <group>
      {/* Simple lighting only */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
    </group>
  );
};
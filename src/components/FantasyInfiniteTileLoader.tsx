
import React from 'react';
import { EnvironmentComponents } from './EnvironmentComponents';

interface FantasyInfiniteTileLoaderProps {
  position: [number, number, number];
  tileIndex: number;
}

export const FantasyInfiniteTileLoader: React.FC<FantasyInfiniteTileLoaderProps> = ({
  position,
  tileIndex
}) => {
  return (
    <group 
      position={position}
      rotation={[-Math.PI / 2, 0, 0]} // Rotate -90° in X so +Z is forward
      scale={[1, 1, 1]}
    >
      <EnvironmentComponents 
        tileIndex={tileIndex}
        position={[0, 0, 0]}
      />
    </group>
  );
};

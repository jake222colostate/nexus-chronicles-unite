
import React from 'react';
import { Vector3 } from 'three';

interface InfiniteEnvironmentSystemProps {
  playerPosition: Vector3;
}

export const InfiniteEnvironmentSystem: React.FC<InfiniteEnvironmentSystemProps> = ({ playerPosition }) => {
  // DISABLED: All infinite environment rendering for 60 FPS performance
  console.log('InfiniteEnvironmentSystem: DISABLED for 60 FPS performance');
  
  return null;
};

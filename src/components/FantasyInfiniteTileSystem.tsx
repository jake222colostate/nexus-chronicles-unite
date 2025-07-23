
import React, { useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { FantasyInfiniteTileLoader } from './FantasyInfiniteTileLoader';

interface FantasyInfiniteTileSystemProps {
  playerPosition: Vector3;
  renderDistance: number;
}

export const FantasyInfiniteTileSystem: React.FC<FantasyInfiniteTileSystemProps> = ({
  playerPosition,
  renderDistance
}) => {
  // DISABLED FOR PERFORMANCE - Contains EnvironmentComponents with trees
  console.log('FantasyInfiniteTileSystem: Disabled for performance');
  return null;
};

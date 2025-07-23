
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
  // DISABLED FOR PERFORMANCE - EnvironmentComponents contain trees
  console.log('FantasyInfiniteTileLoader: Disabled for performance');
  return null;
};

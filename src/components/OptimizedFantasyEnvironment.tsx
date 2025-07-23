
import React, { Suspense } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';
import { EnhancedTreeDistribution } from '../environment/EnhancedTreeDistribution';
import { SeamlessGroundSystem } from './SeamlessGroundSystem';
import { ForestEnvironmentSystem } from './ForestEnvironmentSystem';
import { SkeletonEnemySystem } from './SkeletonEnemySystem';

interface OptimizedFantasyEnvironmentProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
  upgradesPurchased?: number;
  fogDistance: number;
}

export const OptimizedFantasyEnvironment: React.FC<OptimizedFantasyEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage,
  upgradesPurchased = 0,
  fogDistance
}) => {
  // DISABLED FOR PERFORMANCE - All forest elements removed
  console.log(`OptimizedFantasyEnvironment: Disabled for performance`);
  
  // Set enemy count to 0 immediately
  React.useEffect(() => {
    if (onEnemyCountChange) onEnemyCountChange(0);
  }, [onEnemyCountChange]);

  return null;
};


import React from 'react';
import { ChunkData } from './ChunkSystem';

// This component is now deprecated in favor of EnhancedTreeDistribution
// which provides better performance and proper realm switching
interface GLBTreeDistributionSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const GLBTreeDistributionSystem: React.FC<GLBTreeDistributionSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('GLBTreeDistributionSystem: Deprecated - use EnhancedTreeDistribution instead');
  
  // Return null - all functionality moved to EnhancedTreeDistribution
  return null;
};

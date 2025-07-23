import React from 'react';
import { ChunkData } from './ChunkSystem';

interface SimpleTreeSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const SimpleTreeSystem: React.FC<SimpleTreeSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // DISABLED FOR PERFORMANCE - Trees removed
  console.log('SimpleTreeSystem: Disabled for performance');
  return null;
};
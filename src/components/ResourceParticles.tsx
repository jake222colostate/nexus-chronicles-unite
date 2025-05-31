
import React from 'react';

interface ResourceParticlesProps {
  realm: 'fantasy' | 'scifi';
  manaPerSecond: number;
  energyPerSecond: number;
}

// Completely removed - no rendering at all
export const ResourceParticles: React.FC<ResourceParticlesProps> = () => {
  return null;
};

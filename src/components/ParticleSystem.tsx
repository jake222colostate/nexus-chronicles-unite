
import React from 'react';

interface ParticleSystemProps {
  realm: 'fantasy' | 'scifi';
  productionRate: number;
}

// Completely removed - no rendering at all
export const ParticleSystem: React.FC<ParticleSystemProps> = () => {
  return null;
};

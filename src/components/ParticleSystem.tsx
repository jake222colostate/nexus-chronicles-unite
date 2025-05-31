
import React from 'react';

interface ParticleSystemProps {
  realm: 'fantasy' | 'scifi';
  productionRate: number;
}

// Completely removed particle system - no visual elements
export const ParticleSystem: React.FC<ParticleSystemProps> = ({ realm, productionRate }) => {
  return null;
};

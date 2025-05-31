
import React from 'react';

interface ResourceParticlesProps {
  realm: 'fantasy' | 'scifi';
  manaPerSecond: number;
  energyPerSecond: number;
}

// Completely removed resource particles - no 3D elements
export const ResourceParticles: React.FC<ResourceParticlesProps> = ({
  realm,
  manaPerSecond,
  energyPerSecond
}) => {
  return null;
};

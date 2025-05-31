
import React from 'react';

interface ResourceParticlesProps {
  realm: 'fantasy' | 'scifi';
  manaPerSecond: number;
  energyPerSecond: number;
}

// Disabled Three.js particles to eliminate blue diamonds
export const ResourceParticles: React.FC<ResourceParticlesProps> = ({
  realm,
  manaPerSecond,
  energyPerSecond
}) => {
  return null; // No particles at all
};

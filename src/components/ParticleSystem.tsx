
import React from 'react';

interface ParticleSystemProps {
  realm: 'fantasy' | 'scifi';
  productionRate: number;
}

// Completely disabled particle system to eliminate visual noise
export const ParticleSystem: React.FC<ParticleSystemProps> = ({ realm, productionRate }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* No particles - clean background */}
    </div>
  );
};

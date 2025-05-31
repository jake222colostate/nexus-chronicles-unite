
import React from 'react';

interface EnhancedParticleBackgroundProps {
  realm: 'fantasy' | 'scifi';
}

// Completely clean background - no particles, no visual noise
export const EnhancedParticleBackground: React.FC<EnhancedParticleBackgroundProps> = ({ realm }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Clean transparent background only */}
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
};

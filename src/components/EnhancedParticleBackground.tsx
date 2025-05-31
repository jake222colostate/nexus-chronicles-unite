
import React from 'react';

interface EnhancedParticleBackgroundProps {
  realm: 'fantasy' | 'scifi';
}

// Completely removed particle system - only simple gradient overlay
export const EnhancedParticleBackground: React.FC<EnhancedParticleBackgroundProps> = ({ realm }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Simple gradient overlay only - no particles */}
      <div 
        className={`absolute inset-0 opacity-5 ${
          realm === 'fantasy' 
            ? 'bg-gradient-to-b from-purple-900/10 to-transparent' 
            : 'bg-gradient-to-b from-cyan-900/10 to-transparent'
        }`}
      />
    </div>
  );
};

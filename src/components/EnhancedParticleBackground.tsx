
import React from 'react';

interface EnhancedParticleBackgroundProps {
  realm: 'fantasy' | 'scifi';
}

// Simplified particle background - removing all floating particles that cause visual noise
export const EnhancedParticleBackground: React.FC<EnhancedParticleBackgroundProps> = ({ realm }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Simple gradient overlay instead of particles */}
      <div 
        className={`absolute inset-0 opacity-10 ${
          realm === 'fantasy' 
            ? 'bg-gradient-to-b from-purple-900/20 to-transparent' 
            : 'bg-gradient-to-b from-cyan-900/20 to-transparent'
        }`}
      />
    </div>
  );
};

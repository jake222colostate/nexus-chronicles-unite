
import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  realm: 'fantasy' | 'scifi';
  productionRate: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ realm, productionRate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = Math.min(Math.floor(productionRate / 10), 20);

    // Clear existing particles
    container.innerHTML = '';

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = `absolute w-1 h-1 rounded-full animate-ping opacity-60`;
      
      if (realm === 'fantasy') {
        particle.classList.add('bg-purple-400');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particle.style.animationDuration = `${2 + Math.random() * 2}s`;
      } else {
        particle.classList.add('bg-cyan-400');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
      }

      container.appendChild(particle);
    }

    // Cleanup on unmount
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [realm, productionRate]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    />
  );
};

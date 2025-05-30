
import React from 'react';

interface RealmTransitionProps {
  currentRealm: 'fantasy' | 'scifi';
  isTransitioning: boolean;
}

export const RealmTransition: React.FC<RealmTransitionProps> = ({ currentRealm, isTransitioning }) => {
  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Portal Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/10 to-white/30 animate-pulse" />
      
      {/* Energy Ripples */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 border-4 border-purple-400 rounded-full animate-ping opacity-60" />
        <div className="absolute inset-0 w-32 h-32 border-4 border-cyan-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.2s' }} />
        <div className="absolute inset-0 w-32 h-32 border-4 border-yellow-400 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.4s' }} />
      </div>
      
      {/* Transitional Sparkles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-bounce opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
};


import React from 'react';

interface RealmTransitionProps {
  currentRealm: 'fantasy' | 'scifi';
  isTransitioning: boolean;
}

export const RealmTransition: React.FC<RealmTransitionProps> = ({ currentRealm, isTransitioning }) => {
  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Portal Warp Effect */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        currentRealm === 'fantasy' 
          ? 'bg-gradient-radial from-purple-500/20 via-violet-400/10 to-transparent'
          : 'bg-gradient-radial from-cyan-500/20 via-blue-400/10 to-transparent'
      } animate-pulse`} />
      
      {/* Energy Ripples */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`w-40 h-40 border-4 rounded-full animate-ping opacity-60 ${
          currentRealm === 'fantasy' ? 'border-purple-400' : 'border-cyan-400'
        }`} />
        <div className={`absolute inset-0 w-40 h-40 border-4 rounded-full animate-ping opacity-40 ${
          currentRealm === 'fantasy' ? 'border-violet-400' : 'border-blue-400'
        }`} style={{ animationDelay: '0.2s' }} />
        <div className="absolute inset-0 w-40 h-40 border-4 border-yellow-400 rounded-full animate-ping opacity-20" 
             style={{ animationDelay: '0.4s' }} />
      </div>
      
      {/* Realm-specific transition particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-bounce opacity-70 ${
              currentRealm === 'fantasy' 
                ? 'bg-gradient-to-r from-purple-400 to-violet-300' 
                : 'bg-gradient-to-r from-cyan-400 to-blue-300'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>

      {/* Portal center glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`w-20 h-20 rounded-full blur-xl animate-pulse ${
          currentRealm === 'fantasy' 
            ? 'bg-gradient-to-r from-purple-500 to-violet-400' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-400'
        }`} />
      </div>
    </div>
  );
};

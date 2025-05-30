
import React from 'react';

interface AnimatedBackgroundProps {
  realm: 'fantasy' | 'scifi';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ realm }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {realm === 'fantasy' ? (
        <>
          {/* Fantasy Background Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-900" />
          
          {/* Floating Islands */}
          <div className="absolute top-10 left-10 w-20 h-8 bg-gradient-to-r from-green-800/60 to-green-600/40 rounded-full opacity-40 animate-pulse" 
               style={{ animationDuration: '4s' }} />
          <div className="absolute top-32 right-16 w-16 h-6 bg-gradient-to-r from-green-700/50 to-green-500/30 rounded-full opacity-30 animate-pulse" 
               style={{ animationDuration: '6s', animationDelay: '2s' }} />
          
          {/* Aurora Effect */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-400/20 via-pink-300/10 to-transparent animate-pulse opacity-50" 
               style={{ animationDuration: '8s' }} />
          
          {/* Mystical Mist */}
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-green-900/30 via-emerald-800/20 to-transparent animate-pulse" 
               style={{ animationDuration: '10s', animationDelay: '1s' }} />
          
          {/* Floating Particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </>
      ) : (
        <>
          {/* Sci-Fi Background Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900" />
          
          {/* Parallax Stars */}
          <div className="absolute inset-0 stars-scifi opacity-60" />
          
          {/* Glowing Circuits */}
          <div className="absolute top-20 left-5 w-32 h-1 bg-gradient-to-r from-cyan-400/60 to-transparent animate-pulse" 
               style={{ animationDuration: '3s' }} />
          <div className="absolute top-40 right-8 w-24 h-1 bg-gradient-to-l from-blue-400/50 to-transparent animate-pulse" 
               style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-32 left-12 w-1 h-20 bg-gradient-to-t from-cyan-300/40 to-transparent animate-pulse" 
               style={{ animationDuration: '5s', animationDelay: '2s' }} />
          
          {/* Satellite Towers */}
          <div className="absolute top-16 right-4 flex flex-col items-center opacity-30">
            <div className="w-0.5 h-12 bg-cyan-400 animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="w-2 h-2 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Energy Grid Lines */}
          <div className="absolute inset-0">
            <svg className="w-full h-full opacity-20" viewBox="0 0 400 600">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Floating Tech Particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping opacity-50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

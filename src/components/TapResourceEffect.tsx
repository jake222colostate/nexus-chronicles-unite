
import React, { useEffect, useState } from 'react';

interface TapResourceEffectProps {
  realm: 'fantasy' | 'scifi' | 'nexus';
  onComplete: () => void;
}

export const TapResourceEffect: React.FC<TapResourceEffectProps> = ({
  realm,
  onComplete
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-1000 ${
      mounted ? 'opacity-0 -translate-y-20 scale-150' : 'opacity-100 translate-y-0 scale-100'
    }`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md ${
        realm === 'fantasy'
          ? 'bg-purple-600/80 text-purple-100 border border-purple-400/60'
          : realm === 'scifi'
          ? 'bg-cyan-600/80 text-cyan-100 border border-cyan-400/60'
          : 'bg-indigo-600/80 text-indigo-100 border border-indigo-400/60'
      }`}>
        <span className="text-lg font-bold">+1</span>
        <span className="text-sm">
          {realm === 'fantasy' ? '✨' : realm === 'scifi' ? '⚡' : '🌌'}
        </span>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';

interface TapEffectProps {
  x: number;
  y: number;
  realm: 'fantasy' | 'scifi';
  onComplete: () => void;
}

export const TapEffect: React.FC<TapEffectProps> = ({ x, y, realm, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`absolute pointer-events-none z-40 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      }`}
      style={{ left: x - 20, top: y - 20 }}
    >
      <div className={`text-lg font-bold flex items-center gap-1 ${
        realm === 'fantasy' ? 'text-purple-300' : 'text-cyan-300'
      }`}>
        <span>+1</span>
        {realm === 'fantasy' ? (
          <div className="relative">
            ✨
            <div className="absolute inset-0 animate-ping">✨</div>
          </div>
        ) : (
          <div className="relative">
            ⚡
            <div className="absolute inset-0 animate-ping">⚡</div>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';

interface MuzzleFlashProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const MuzzleFlash: React.FC<MuzzleFlashProps> = ({ isVisible, onComplete }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative">
        {/* Main flash */}
        <div className="w-16 h-16 bg-yellow-400/80 rounded-full animate-ping" />
        <div className="absolute inset-0 w-16 h-16 bg-white/60 rounded-full animate-pulse" />
        <div className="absolute inset-2 w-12 h-12 bg-orange-500/70 rounded-full animate-bounce" />
        
        {/* Sparks */}
        <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
        <div className="absolute -top-1 -right-3 w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
        <div className="absolute -bottom-2 left-1 w-1 h-1 bg-red-400 rounded-full animate-bounce" />
        <div className="absolute top-1 -right-2 w-1 h-1 bg-yellow-500 rounded-full animate-ping" />
      </div>
    </div>
  );
};

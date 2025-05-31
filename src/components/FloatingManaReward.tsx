
import React, { useState, useEffect } from 'react';

interface FloatingManaRewardProps {
  amount: number;
  position: { x: number; y: number };
  onComplete: () => void;
}

export const FloatingManaReward: React.FC<FloatingManaRewardProps> = ({
  amount,
  position,
  onComplete
}) => {
  const [opacity, setOpacity] = useState(1);
  const [yOffset, setYOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setYOffset(prev => prev - 2);
      setOpacity(prev => {
        const newOpacity = prev - 0.02;
        if (newOpacity <= 0) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return newOpacity;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-50 text-yellow-400 font-bold text-lg"
      style={{
        left: `${position.x}%`,
        top: `${position.y + yOffset}%`,
        opacity,
        transform: 'translateX(-50%)',
        transition: 'none'
      }}
    >
      +{amount} Mana
    </div>
  );
};

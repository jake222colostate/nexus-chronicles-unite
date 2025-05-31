
import React, { useEffect, useState } from 'react';

interface WaveCompleteMessageProps {
  isVisible: boolean;
  waveNumber: number;
  onComplete: () => void;
}

export const WaveCompleteMessage: React.FC<WaveCompleteMessageProps> = ({
  isVisible,
  waveNumber,
  onComplete
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-green-600/95 to-emerald-600/95 backdrop-blur-xl rounded-xl border border-green-400/40 px-8 py-4 animate-scale-in">
        <div className="text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-1">Wave Complete!</h2>
          <p className="text-green-200 text-sm">Wave {waveNumber} cleared</p>
          <div className="text-yellow-400 text-sm mt-2">+100 Bonus Mana!</div>
        </div>
      </div>
    </div>
  );
};

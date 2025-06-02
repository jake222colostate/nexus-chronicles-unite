
import React from 'react';

interface Fantasy3DInsufficientManaMessageProps {
  show: boolean;
}

export const Fantasy3DInsufficientManaMessage: React.FC<Fantasy3DInsufficientManaMessageProps> = ({
  show
}) => {
  if (!show) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-red-600/95 text-white px-8 py-4 rounded-xl border-2 border-red-400 animate-bounce shadow-2xl">
        <p className="font-bold text-lg">✨ Not enough mana! ✨</p>
      </div>
    </div>
  );
};

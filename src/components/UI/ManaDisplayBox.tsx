
import React from 'react';

interface ManaDisplayBoxProps {
  mana: number;
  manaPerSecond: number;
  realm: 'fantasy' | 'scifi';
}

export const ManaDisplayBox: React.FC<ManaDisplayBoxProps> = ({
  mana,
  manaPerSecond,
  realm
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e24) return (num / 1e24).toFixed(1) + 'Sp';
    if (num >= 1e21) return (num / 1e21).toFixed(1) + 'Sx';
    if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Qa';
    if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Qd';
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const formatRate = (rate: number): string => {
    if (rate === 0) return '0';
    return formatNumber(rate);
  };

  return (
    <div className="absolute top-16 right-4 z-30 animate-fade-in pointer-events-none">
      <div 
        className={`px-4 py-3 rounded-lg border backdrop-blur-xl ${
          realm === 'fantasy'
            ? 'bg-purple-900/90 border-purple-400/40 text-purple-100'
            : 'bg-cyan-900/90 border-cyan-400/40 text-cyan-100'
        }`}
        style={{
          boxShadow: `0 3px 8px rgba(0, 0, 0, 0.3), 0 0 15px ${
            realm === 'fantasy' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(34, 211, 238, 0.2)'
          }`
        }}
      >
        <div className="text-right">
          <div className={`text-lg font-bold ${
            realm === 'fantasy' ? 'text-yellow-400' : 'text-cyan-300'
          }`}>
            {formatNumber(mana)} Mana
          </div>
          <div className={`text-sm ${
            realm === 'fantasy' ? 'text-purple-300' : 'text-cyan-400'
          }`}>
            +{formatRate(manaPerSecond)}/sec
          </div>
        </div>
      </div>
    </div>
  );
};

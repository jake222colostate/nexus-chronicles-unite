import React from 'react';

interface ManaDisplayBoxProps {
  mana: number;
  manaPerSecond: number;
  realm: 'fantasy' | 'scifi';
}

// Component removed - mana display now integrated into TopHUD to prevent duplicates
export const ManaDisplayBox: React.FC<ManaDisplayBoxProps> = () => {
  return null;
};


import React from 'react';

interface ResourceTooltipProps {
  mana: number;
  energyCredits: number;
  manaPerSecond: number;
  energyPerSecond: number;
  convergenceProgress: number;
  realm: 'fantasy' | 'scifi';
}

export const ResourceTooltip: React.FC<ResourceTooltipProps> = () => {
  // Component disabled - resources now shown only in TopHUD
  return null;
};


import React from 'react';

interface EnhancedResourceSidebarProps {
  realm: 'fantasy' | 'scifi';
  mana: number;
  energyCredits: number;
  manaPerSecond: number;
  energyPerSecond: number;
  nexusShards: number;
  convergenceProgress: number;
  onHelpClick?: () => void;
}

// Component removed - resources now shown only in TopHUD to prevent overlap
export const EnhancedResourceSidebar: React.FC<EnhancedResourceSidebarProps> = () => {
  return null;
};

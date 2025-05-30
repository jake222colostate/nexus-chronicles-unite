
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface ConvergenceManagerProps {
  mana: number;
  energyCredits: number;
  onShowConvergence: () => void;
}

export const ConvergenceManager: React.FC<ConvergenceManagerProps> = ({
  mana,
  energyCredits,
  onShowConvergence
}) => {
  // Stable convergence calculations
  const convergenceData = useMemo(() => {
    const totalValue = (mana || 0) + (energyCredits || 0);
    const canConverge = totalValue >= 1000;
    const progress = Math.min((totalValue / 1000) * 100, 100);
    
    return { canConverge, progress };
  }, [mana, energyCredits]);

  if (!convergenceData.canConverge) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
      <Button 
        onClick={onShowConvergence}
        className="h-11 px-6 rounded-xl bg-gradient-to-r from-yellow-500/95 to-orange-500/95 hover:from-yellow-600/95 hover:to-orange-600/95 backdrop-blur-xl border border-yellow-400/70 animate-pulse transition-all duration-300 font-bold shadow-lg shadow-yellow-500/30"
      >
        <span className="text-sm flex items-center gap-2">
          🔁 Convergence Ready!
        </span>
      </Button>
    </div>
  );
};

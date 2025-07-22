
import { useEffect, useCallback } from 'react';
import { useAutoEnergyStore } from '@/stores/useAutoEnergyStore';


interface UseAutoEnergySystemProps {
  onAddEnergy: (amount: number) => void;
}

export const useAutoEnergySystem = ({ onAddEnergy }: UseAutoEnergySystemProps) => {
  const energyPerSecond = useAutoEnergyStore((state) => state.energyPerSecond);
  

  useEffect(() => {
    if (energyPerSecond <= 0) return;

    const interval = setInterval(() => {
      onAddEnergy(energyPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [energyPerSecond, onAddEnergy]);
};

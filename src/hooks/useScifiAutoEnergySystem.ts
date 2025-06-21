
import { useEffect } from 'react';
import { useAutoClickerStore } from '@/stores/useAutoClickerStore';

interface UseScifiAutoEnergySystemProps {
  onAddEnergy: (amount: number) => void;
}

export const useScifiAutoEnergySystem = ({ onAddEnergy }: UseScifiAutoEnergySystemProps) => {
  const energyPerSecond = useAutoClickerStore((state) => state.manaPerSecond); // Reusing the same store but for energy

  useEffect(() => {
    if (energyPerSecond <= 0) return;

    const interval = setInterval(() => {
      onAddEnergy(energyPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [energyPerSecond, onAddEnergy]);
};

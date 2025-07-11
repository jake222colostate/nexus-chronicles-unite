
import { useEffect, useCallback } from 'react';
import { useAutoEnergyStore } from '@/stores/useAutoEnergyStore';
import { useMapEditorStore } from '@/stores/useMapEditorStore';

interface UseAutoEnergySystemProps {
  onAddEnergy: (amount: number) => void;
}

export const useAutoEnergySystem = ({ onAddEnergy }: UseAutoEnergySystemProps) => {
  const energyPerSecond = useAutoEnergyStore((state) => state.energyPerSecond);
  const isEditorActive = useMapEditorStore((state) => state.isEditorActive);

  const createFloatingEnergyText = useCallback((amount: number) => {
    const energyDisplay = document.querySelector('[data-energy-display]');
    if (energyDisplay && amount > 0) {
      const rect = energyDisplay.getBoundingClientRect();
      const popup = document.createElement('div');
      popup.textContent = `+${amount} Energy`;
      popup.className = 'fixed text-cyan-400 font-bold text-sm pointer-events-none z-50 animate-fade-in';
      popup.style.left = `${rect.right + 10}px`;
      popup.style.top = `${rect.top}px`;
      popup.style.transform = 'translateY(0)';
      document.body.appendChild(popup);
      
      setTimeout(() => {
        popup.style.transform = 'translateY(-30px)';
        popup.style.opacity = '0';
        popup.style.transition = 'all 1s ease-out';
      }, 100);
      
      setTimeout(() => {
        if (document.body.contains(popup)) {
          document.body.removeChild(popup);
        }
      }, 1100);
    }
  }, []);

  useEffect(() => {
    if (isEditorActive || energyPerSecond <= 0) return;

    const interval = setInterval(() => {
      onAddEnergy(energyPerSecond);
      createFloatingEnergyText(energyPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [energyPerSecond, onAddEnergy, createFloatingEnergyText, isEditorActive]);
};

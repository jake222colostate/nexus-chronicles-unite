
import { useEffect, useCallback } from 'react';
import { useAutoManaStore } from '@/stores/useAutoManaStore';
import { useMapEditorStore } from '@/stores/useMapEditorStore';

interface UseAutoManaSystemProps {
  onAddMana: (amount: number) => void;
}

export const useAutoManaSystem = ({ onAddMana }: UseAutoManaSystemProps) => {
  const manaPerSecond = useAutoManaStore((state) => state.manaPerSecond);
  const isEditorActive = useMapEditorStore((state) => state.isEditorActive);

  const createFloatingManaText = useCallback((amount: number) => {
    const manaDisplay = document.querySelector('[data-mana-display]');
    if (manaDisplay && amount > 0) {
      const rect = manaDisplay.getBoundingClientRect();
      const popup = document.createElement('div');
      popup.textContent = `+${amount} Mana`;
      popup.className = 'fixed text-purple-400 font-bold text-sm pointer-events-none z-50 animate-fade-in';
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
    if (isEditorActive || manaPerSecond <= 0) return;

    const interval = setInterval(() => {
      onAddMana(manaPerSecond);
      createFloatingManaText(manaPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [manaPerSecond, onAddMana, createFloatingManaText, isEditorActive]);
};

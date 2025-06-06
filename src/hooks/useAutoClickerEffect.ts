
import { useEffect } from 'react';
import { useAutoClickerStore } from '@/stores/useAutoClickerStore';

interface UseAutoClickerEffectProps {
  onAddMana: (amount: number) => void;
}

export const useAutoClickerEffect = ({ onAddMana }: UseAutoClickerEffectProps) => {
  const manaPerSecond = useAutoClickerStore((state) => state.manaPerSecond);

  useEffect(() => {
    if (manaPerSecond <= 0) return;

    const interval = setInterval(() => {
      onAddMana(manaPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [manaPerSecond, onAddMana]);
};

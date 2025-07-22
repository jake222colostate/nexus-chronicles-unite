
import { useEffect, useCallback } from 'react';
import { useAutoManaStore } from '@/stores/useAutoManaStore';


interface UseAutoManaSystemProps {
  onAddMana: (amount: number) => void;
}

export const useAutoManaSystem = ({ onAddMana }: UseAutoManaSystemProps) => {
  const manaPerSecond = useAutoManaStore((state) => state.manaPerSecond);
  

  useEffect(() => {
    if (manaPerSecond <= 0) return;

    const interval = setInterval(() => {
      onAddMana(manaPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [manaPerSecond, onAddMana]);
};

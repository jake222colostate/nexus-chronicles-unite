
import { create } from 'zustand';

interface AutoClickerState {
  level: number;
  manaPerSecond: number;
  upgradeCost: number;
  upgrade: () => void;
}

export const useAutoClickerStore = create<AutoClickerState>((set) => ({
  level: 0,
  manaPerSecond: 0,
  upgradeCost: 25,
  upgrade: () =>
    set((state) => {
      const newLevel = state.level + 1;
      return {
        level: newLevel,
        manaPerSecond: newLevel * 2,
        upgradeCost: Math.floor(state.upgradeCost * 1.5),
      };
    }),
}));

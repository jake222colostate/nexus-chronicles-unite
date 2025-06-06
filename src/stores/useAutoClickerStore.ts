
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
  upgradeCost: 50,
  upgrade: () =>
    set((state) => {
      const newLevel = state.level + 1;
      return {
        level: newLevel,
        manaPerSecond: newLevel, // +1 mana/sec per level
        upgradeCost: Math.floor(50 * Math.pow(1.15, newLevel)),
      };
    }),
}));

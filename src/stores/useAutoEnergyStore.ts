import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AutoEnergyState {
  level: number;
  energyPerSecond: number;
  upgradeCost: number;
  upgrade: () => void;
}

export const useAutoEnergyStore = create<AutoEnergyState>()(
  persist(
    (set) => ({
      level: 0,
      energyPerSecond: 0,
      upgradeCost: 50,
      upgrade: () =>
        set((state) => {
          const newLevel = state.level + 1;
          return {
            level: newLevel,
            energyPerSecond: newLevel, // +1 energy/sec per level
            upgradeCost: Math.floor(50 * Math.pow(1.15, newLevel)),
          };
        }),
    }),
    {
      name: 'auto-energy-store',
      version: 1
    }
  )
);
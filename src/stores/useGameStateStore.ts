import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, initialGameState } from './gameStateTypes';
import { GameStateActions, createGameStateActions } from './gameStateActions';

export const useGameStateStore = create<GameState & GameStateActions>()(
  persist(
    (set, get) => ({
      ...initialGameState,
      ...createGameStateActions(set, get)
    }),
    {
      name: 'nexus-game-state',
      version: 1
    }
  )
);
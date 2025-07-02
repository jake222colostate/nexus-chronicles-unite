import { create } from 'zustand';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

interface InventoryState {
  items: InventoryItem[];
  addItem: (name: string) => void;
  removeItem: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  addItem: (name) =>
    set((state) => {
      const existing = state.items.find((i) => i.name === name);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.name === name ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [...state.items, { id: `${name}-${Date.now()}`, name, quantity: 1 }],
      };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));

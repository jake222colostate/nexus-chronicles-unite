import { create } from 'zustand';

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  maxStack: number;
}

interface InventoryState {
  hotbar: (InventoryItem | null)[];
  inventory: (InventoryItem | null)[];
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity?: number) => boolean;
  removeItem: (id: string, quantity?: number) => boolean;
  getItemQuantity: (id: string) => number;
}

const HOTBAR_SIZE = 6;
const INVENTORY_SIZE = 24;

export const useInventoryStore = create<InventoryState>((set, get) => ({
  hotbar: Array(HOTBAR_SIZE).fill(null),
  inventory: Array(INVENTORY_SIZE).fill(null),

  addItem: (newItem, quantity = 1) => {
    const state = get();
    let remainingQuantity = quantity;

    // First, try to stack with existing items in hotbar and inventory
    const allSlots = [...state.hotbar, ...state.inventory];
    const allSlotsWithIndex = allSlots.map((item, index) => ({
      item,
      isHotbar: index < HOTBAR_SIZE,
      slotIndex: index < HOTBAR_SIZE ? index : index - HOTBAR_SIZE
    }));

    // Find existing stacks of the same item
    for (const slot of allSlotsWithIndex) {
      if (remainingQuantity <= 0) break;
      
      if (slot.item && slot.item.id === newItem.id) {
        const canAdd = Math.min(remainingQuantity, newItem.maxStack - slot.item.quantity);
        if (canAdd > 0) {
          const updatedItem = { ...slot.item, quantity: slot.item.quantity + canAdd };
          
          if (slot.isHotbar) {
            set(state => ({
              hotbar: state.hotbar.map((item, index) => 
                index === slot.slotIndex ? updatedItem : item
              )
            }));
          } else {
            set(state => ({
              inventory: state.inventory.map((item, index) => 
                index === slot.slotIndex ? updatedItem : item
              )
            }));
          }
          
          remainingQuantity -= canAdd;
        }
      }
    }

    // If there's still quantity remaining, try to add to empty slots
    while (remainingQuantity > 0) {
      const quantityToAdd = Math.min(remainingQuantity, newItem.maxStack);
      const itemToAdd: InventoryItem = { ...newItem, quantity: quantityToAdd };
      
      // Try hotbar first
      const emptyHotbarIndex = state.hotbar.findIndex(slot => slot === null);
      if (emptyHotbarIndex !== -1) {
        set(state => ({
          hotbar: state.hotbar.map((item, index) => 
            index === emptyHotbarIndex ? itemToAdd : item
          )
        }));
        remainingQuantity -= quantityToAdd;
        continue;
      }

      // Then try inventory
      const emptyInventoryIndex = state.inventory.findIndex(slot => slot === null);
      if (emptyInventoryIndex !== -1) {
        set(state => ({
          inventory: state.inventory.map((item, index) => 
            index === emptyInventoryIndex ? itemToAdd : item
          )
        }));
        remainingQuantity -= quantityToAdd;
        continue;
      }

      // No more space
      break;
    }

    return remainingQuantity === 0; // Returns true if all items were added
  },

  removeItem: (id, quantity = 1) => {
    const state = get();
    let remainingToRemove = quantity;

    // Remove from hotbar and inventory
    const updateSlots = (slots: (InventoryItem | null)[]) => {
      return slots.map(item => {
        if (remainingToRemove <= 0 || !item || item.id !== id) return item;
        
        const toRemove = Math.min(remainingToRemove, item.quantity);
        remainingToRemove -= toRemove;
        
        const newQuantity = item.quantity - toRemove;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      });
    };

    set(state => ({
      hotbar: updateSlots(state.hotbar),
      inventory: updateSlots(state.inventory)
    }));

    return remainingToRemove === 0;
  },

  getItemQuantity: (id) => {
    const state = get();
    let total = 0;
    
    [...state.hotbar, ...state.inventory].forEach(item => {
      if (item && item.id === id) {
        total += item.quantity;
      }
    });
    
    return total;
  }
}));
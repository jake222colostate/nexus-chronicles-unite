import React, { useState } from 'react';
import { MinecraftHotbar } from './MinecraftHotbar';
import { MinecraftInventory } from './MinecraftInventory';
import { useInventoryStore } from '@/stores/useInventoryStore';

export const InventoryManager: React.FC = () => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState(0);
  const { hotbar } = useInventoryStore();

  const handleHotbarSlotSelect = (slot: number) => {
    setSelectedHotbarSlot(slot);
  };

  const toggleInventory = () => {
    setIsInventoryOpen(!isInventoryOpen);
  };

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Numbers 1-6 for hotbar selection
      if (event.key >= '1' && event.key <= '6') {
        const slot = parseInt(event.key) - 1;
        setSelectedHotbarSlot(slot);
      }
      
      // E or I to toggle inventory
      if (event.key.toLowerCase() === 'e' || event.key.toLowerCase() === 'i') {
        toggleInventory();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      {/* Hotbar - always visible */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <MinecraftHotbar
          selectedSlot={selectedHotbarSlot}
          onSlotSelect={handleHotbarSlotSelect}
          items={hotbar}
        />
      </div>

      {/* Inventory Modal */}
      <MinecraftInventory
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />

      {/* Inventory Toggle Button - mobile friendly */}
      <div className="absolute bottom-2 right-2 z-40">
        <button
          onClick={toggleInventory}
          className="w-12 h-12 bg-stone-800/90 border-2 border-stone-600 rounded-lg flex items-center justify-center text-white hover:bg-stone-700/90 transition-colors"
        >
          📦
        </button>
      </div>
    </>
  );
};
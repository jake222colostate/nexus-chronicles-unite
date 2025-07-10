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
      {/* Hotbar - positioned relative to phone screen */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50">
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

      {/* Inventory Toggle Button - positioned relative to phone screen */}
      <div className="absolute bottom-2 right-2 z-50">
        <button
          onClick={toggleInventory}
          className="w-8 h-8 bg-stone-800/80 border border-stone-600 rounded-md flex items-center justify-center text-white hover:bg-stone-700/80 transition-colors text-xs"
        >
          📦
        </button>
      </div>
    </>
  );
};
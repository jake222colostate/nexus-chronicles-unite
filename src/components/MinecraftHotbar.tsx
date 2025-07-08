import React from 'react';

interface MinecraftHotbarProps {
  selectedSlot?: number;
  onSlotSelect?: (slot: number) => void;
}

export const MinecraftHotbar: React.FC<MinecraftHotbarProps> = ({
  selectedSlot = 0,
  onSlotSelect
}) => {
  const slots = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex gap-1 bg-stone-800/90 backdrop-blur-md p-2 rounded-lg border-2 border-stone-600/80">
      {slots.map((slot) => (
        <div
          key={slot}
          onClick={() => onSlotSelect?.(slot)}
          className={`w-12 h-12 rounded-md border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedSlot === slot
              ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-400/40'
              : 'border-stone-500 bg-stone-700/80 hover:border-stone-400'
          }`}
        >
          {/* Slot content would go here */}
        </div>
      ))}
    </div>
  );
};
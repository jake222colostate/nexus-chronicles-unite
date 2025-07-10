import React from 'react';
import { InventoryItem } from '@/stores/useInventoryStore';

interface MinecraftHotbarProps {
  selectedSlot?: number;
  onSlotSelect?: (slot: number) => void;
  items?: (InventoryItem | null)[];
}

export const MinecraftHotbar: React.FC<MinecraftHotbarProps> = ({
  selectedSlot = 0,
  onSlotSelect,
  items = Array(6).fill(null)
}) => {
  const slots = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="flex gap-0.5 bg-stone-800/70 backdrop-blur-sm p-1 rounded border border-stone-600/60">
      {slots.map((slot) => (
        <div
          key={slot}
          onClick={() => onSlotSelect?.(slot)}
          className={`w-8 h-8 rounded border cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedSlot === slot
              ? 'border-amber-400 bg-amber-500/20 shadow-sm shadow-amber-400/40'
              : 'border-stone-500 bg-stone-700/60 hover:border-stone-400'
          }`}
        >
          {items[slot] && (
            <div className="relative w-full h-full flex items-center justify-center">
              <span className="text-xs leading-none">{items[slot]!.icon}</span>
              {items[slot]!.quantity > 1 && (
                <span className="absolute -bottom-0.5 -right-0.5 text-xs font-bold text-white bg-black/70 rounded px-0.5 leading-none min-w-[12px] text-center">
                  {items[slot]!.quantity > 99 ? '99+' : items[slot]!.quantity}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
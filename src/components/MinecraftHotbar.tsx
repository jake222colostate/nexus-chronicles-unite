import React from 'react';

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface MinecraftHotbarProps {
  selectedSlot?: number;
  onSlotSelect?: (slot: number) => void;
}

export const MinecraftHotbar: React.FC<MinecraftHotbarProps> = ({
  selectedSlot = 0,
  onSlotSelect
}) => {
  // Sample hotbar items (in a real game, this would come from game state)
  const hotbarItems: (InventoryItem | null)[] = [
    { id: '1', name: 'Magic Crystal', icon: '💎', quantity: 15, rarity: 'epic' },
    { id: '2', name: 'Health Potion', icon: '🧪', quantity: 3, rarity: 'common' },
    { id: '3', name: 'Ancient Scroll', icon: '📜', quantity: 1, rarity: 'legendary' },
    { id: '4', name: 'Iron Sword', icon: '⚔️', quantity: 1, rarity: 'rare' },
    null,
    null,
    null,
    null,
    { id: '5', name: 'Wood Logs', icon: '🪵', quantity: 64, rarity: 'common' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-800/50';
      case 'rare': return 'border-blue-400 bg-blue-900/30';
      case 'epic': return 'border-purple-400 bg-purple-900/30';
      case 'legendary': return 'border-yellow-400 bg-yellow-900/30';
      default: return 'border-gray-600 bg-gray-800/30';
    }
  };

  return (
    <div className="fixed bottom-44 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[320px] px-2">
      <div className="flex gap-0.5 p-1.5 bg-black/80 backdrop-blur-md border-2 border-stone-600 rounded-lg justify-center">
        {hotbarItems.map((item, index) => (
          <div
            key={index}
            onClick={() => onSlotSelect?.(index)}
            className={`
              w-9 h-9 border-2 rounded flex flex-col items-center justify-center
              cursor-pointer active:bg-stone-600/50 transition-all duration-200
              relative group flex-shrink-0
              ${selectedSlot === index ? 'ring-1 ring-white ring-offset-1 ring-offset-black/50' : ''}
              ${item ? getRarityColor(item.rarity) : 'border-stone-600 bg-stone-800/30'}
            `}
          >
            {/* Slot number - smaller for mobile */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-black/80 text-white text-[8px] rounded-full flex items-center justify-center border border-stone-500">
              {index + 1}
            </div>
            
            {item && (
              <>
                <span className="text-xl leading-none">{item.icon}</span>
                {item.quantity > 1 && (
                  <span className="absolute bottom-0 right-0 text-xs font-bold text-white bg-black/70 rounded px-1 leading-none">
                    {item.quantity > 64 ? '64+' : item.quantity}
                  </span>
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  <div className={`font-semibold ${
                    item.rarity === 'legendary' ? 'text-yellow-400' :
                    item.rarity === 'epic' ? 'text-purple-400' :
                    item.rarity === 'rare' ? 'text-blue-400' :
                    'text-white'
                  }`}>
                    {item.name}
                  </div>
                  <div className="text-gray-400">Quantity: {item.quantity}</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Hotbar instructions */}
      <div className="text-center mt-2">
        <span className="text-white/60 text-xs">
          Press 1-9 to select items
        </span>
      </div>
    </div>
  );
};
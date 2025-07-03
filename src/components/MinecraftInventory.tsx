import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MinecraftInventoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const MinecraftInventory: React.FC<MinecraftInventoryProps> = ({
  isOpen,
  onClose
}) => {
  // Sample inventory items
  const inventoryItems: (InventoryItem | null)[] = [
    { id: '1', name: 'Magic Crystal', icon: '💎', quantity: 15, rarity: 'epic' },
    { id: '2', name: 'Health Potion', icon: '🧪', quantity: 3, rarity: 'common' },
    { id: '3', name: 'Ancient Scroll', icon: '📜', quantity: 1, rarity: 'legendary' },
    { id: '4', name: 'Iron Sword', icon: '⚔️', quantity: 1, rarity: 'rare' },
    { id: '5', name: 'Wood Logs', icon: '🪵', quantity: 64, rarity: 'common' },
    ...Array(31).fill(null) // Empty slots
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-800 border-4 border-stone-600 rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-100 minecraft-font">Inventory</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-stone-300 hover:text-stone-100 hover:bg-stone-700 p-2"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Main Inventory Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-stone-200 mb-3">Main Inventory</h3>
          <div className="grid grid-cols-9 gap-1 p-4 bg-stone-900/50 border-2 border-stone-700 rounded">
            {inventoryItems.slice(0, 27).map((item, index) => (
              <div
                key={index}
                className={`
                  w-12 h-12 border-2 rounded flex flex-col items-center justify-center
                  cursor-pointer hover:bg-stone-600/50 transition-all duration-200
                  relative group
                  ${item ? getRarityColor(item.rarity) : 'border-stone-600 bg-stone-800/30'}
                `}
              >
                {item && (
                  <>
                    <span className="text-lg leading-none">{item.icon}</span>
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
        </div>

        {/* Hotbar */}
        <div>
          <h3 className="text-lg font-semibold text-stone-200 mb-3">Hotbar</h3>
          <div className="grid grid-cols-9 gap-1 p-4 bg-stone-900/70 border-2 border-stone-700 rounded">
            {inventoryItems.slice(27, 36).map((item, index) => (
              <div
                key={index + 27}
                className={`
                  w-12 h-12 border-2 rounded flex flex-col items-center justify-center
                  cursor-pointer hover:bg-stone-600/50 transition-all duration-200
                  relative group
                  ${item ? getRarityColor(item.rarity) : 'border-stone-600 bg-stone-800/30'}
                `}
              >
                {item && (
                  <>
                    <span className="text-lg leading-none">{item.icon}</span>
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
        </div>

        {/* Stats */}
        <div className="mt-4 text-center text-stone-400 text-sm">
          {inventoryItems.filter(item => item !== null).length} / 36 slots used
        </div>
      </div>
    </div>
  );
};
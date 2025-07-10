import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useInventoryStore, InventoryItem } from '@/stores/useInventoryStore';

interface MinecraftInventoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MinecraftInventory: React.FC<MinecraftInventoryProps> = ({
  isOpen,
  onClose
}) => {
  const { hotbar, inventory } = useInventoryStore();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2">
      <div className="bg-stone-800 border-4 border-stone-600 rounded-lg p-3 max-w-sm w-full max-h-[85vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-100">Inventory</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-stone-300 hover:text-stone-100 hover:bg-stone-700 p-1"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Main Inventory Grid - Compact for mobile */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-stone-200 mb-2">Main Inventory</h3>
          <div className="grid grid-cols-6 gap-1 p-2 bg-stone-900/50 border-2 border-stone-700 rounded">
            {inventory.map((item, index) => (
              <div
                key={index}
                className={`
                  w-10 h-10 border-2 rounded flex flex-col items-center justify-center
                  cursor-pointer hover:bg-stone-600/50 transition-all duration-200
                  relative group
                  ${item ? getRarityColor(item.rarity) : 'border-stone-600 bg-stone-800/30'}
                `}
              >
                {item && (
                  <>
                    <span className="text-sm leading-none">{item.icon}</span>
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

        {/* Hotbar - Compact */}
        <div>
          <h3 className="text-sm font-semibold text-stone-200 mb-2">Hotbar</h3>
          <div className="grid grid-cols-6 gap-1 p-2 bg-stone-900/70 border-2 border-stone-700 rounded">
            {hotbar.map((item, index) => (
              <div
                key={index}
                className={`
                  w-10 h-10 border-2 rounded flex flex-col items-center justify-center
                  cursor-pointer hover:bg-stone-600/50 transition-all duration-200
                  relative group
                  ${item ? getRarityColor(item.rarity) : 'border-stone-600 bg-stone-800/30'}
                `}
              >
                {item && (
                  <>
                    <span className="text-sm leading-none">{item.icon}</span>
                    {item.quantity > 1 && (
                      <span className="absolute bottom-0 right-0 text-xs font-bold text-white bg-black/70 rounded px-1 leading-none">
                        {item.quantity > 64 ? '64+' : item.quantity}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 text-center text-stone-400 text-xs">
          {[...hotbar, ...inventory].filter(item => item !== null).length} / 30 slots used
        </div>
      </div>
    </div>
  );
};
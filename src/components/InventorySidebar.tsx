import React from 'react';
import { useInventoryStore } from '@/stores/useInventoryStore';

const InventorySidebar: React.FC = () => {
  const items = useInventoryStore((s) => s.items);
  return (
    <div className="fixed left-0 top-0 bottom-0 w-28 bg-black/70 backdrop-blur-md p-2 flex flex-col z-40 overflow-y-auto">
      <h3 className="text-white text-sm font-bold mb-2">Inventory</h3>
      {items.length === 0 && (
        <span className="text-gray-400 text-xs">Empty</span>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between mb-1 text-white text-xs"
        >
          <span>{item.name}</span>
          <span className="ml-2 font-bold">{item.quantity}</span>
        </div>
      ))}
    </div>
  );
};

export default InventorySidebar;

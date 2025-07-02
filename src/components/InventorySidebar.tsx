import React from 'react';
import { useInventoryStore } from '../stores/useInventoryStore';

const InventorySidebar: React.FC = () => {
  const items = useInventoryStore((s) => s.items);
  return (
    <div className="fixed left-0 top-16 bottom-32 w-24 bg-black/80 backdrop-blur-md p-2 flex flex-col z-30 overflow-y-auto border-r border-white/20">
      <h3 className="text-white text-xs font-bold mb-2">Items</h3>
      {items.length === 0 && (
        <span className="text-gray-400 text-xs">Empty</span>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between mb-1 text-white text-xs">
          <span>{item.name}</span>
          <span className="ml-2 font-bold">{item.quantity}</span>
        </div>
      ))}
    </div>
  );
};

export default InventorySidebar;

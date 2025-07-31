import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nexusUpgradeModules, NexusUpgradeModule } from '@/data/NexusUpgradeModules';

interface UpgradeSelectionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUpgrade: (moduleId: string) => void;
  position: { x: number; y: number };
}

export const UpgradeSelectionMenu: React.FC<UpgradeSelectionMenuProps> = ({
  isOpen,
  onClose,
  onSelectUpgrade,
  position
}) => {
  if (!isOpen) return null;

  const handleUpgradeSelect = (moduleId: string) => {
    onSelectUpgrade(moduleId);
    onClose();
  };

  return (
    <div 
      className="fixed bg-black/90 backdrop-blur-sm rounded-lg border border-gray-600/40 p-4 z-50 min-w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Select Upgrade</h3>
        <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
          <X size={16} />
        </Button>
      </div>

      {/* Upgrade Options */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {nexusUpgradeModules.map((module) => (
          <div
            key={module.id}
            onClick={() => handleUpgradeSelect(module.id)}
            className="bg-black/40 rounded-lg p-3 border border-gray-600/20 hover:border-blue-400/40 cursor-pointer transition-all duration-200 hover:bg-blue-900/20"
          >
            <div className="text-center mb-2">
              <div className="text-2xl mb-1">{module.icon}</div>
              <div className="text-sm font-semibold text-white">{module.name}</div>
            </div>
            
            <div className="text-xs text-gray-300 text-center mb-2">
              {module.description}
            </div>
            
            <div className="text-xs text-center">
              <div className={`font-bold ${module.realm === 'fantasy' ? 'text-purple-400' : 'text-cyan-400'}`}>
                {module.bonus}
              </div>
              <div className="text-green-400 font-bold">FREE</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
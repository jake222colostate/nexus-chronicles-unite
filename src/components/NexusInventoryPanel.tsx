import React, { useState } from 'react';
import { X, Package, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryModule {
  id: string;
  name: string;
  description: string;
  effectType: string;
  value: number;
  realmAffected: 'fantasy' | 'scifi' | 'all';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  visualTheme: {
    crystalColor: string;
    glowColor: string;
  };
}

interface NexusInventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleSelect: (moduleId: string) => void;
  gameState: any;
}

// Mock inventory items - in real implementation, these would come from gameState
const inventoryModules: InventoryModule[] = [
  {
    id: 'mana_boost_crystal',
    name: 'Mana Boost Crystal',
    description: '+15% mana generation rate',
    effectType: 'manaBoost',
    value: 15,
    realmAffected: 'fantasy',
    rarity: 'common',
    visualTheme: {
      crystalColor: '#9333ea',
      glowColor: '#a855f7'
    }
  },
  {
    id: 'energy_amplifier',
    name: 'Energy Amplifier',
    description: '+20% energy generation rate',
    effectType: 'energyBoost', 
    value: 20,
    realmAffected: 'scifi',
    rarity: 'rare',
    visualTheme: {
      crystalColor: '#06b6d4',
      glowColor: '#22d3ee'
    }
  },
  {
    id: 'nexus_synchronizer',
    name: 'Nexus Synchronizer',
    description: '+10% all resource generation',
    effectType: 'globalBoost',
    value: 10,
    realmAffected: 'all',
    rarity: 'epic',
    visualTheme: {
      crystalColor: '#f59e0b',
      glowColor: '#fbbf24'
    }
  },
  {
    id: 'convergence_catalyst',
    name: 'Convergence Catalyst',
    description: '+50% convergence speed',
    effectType: 'convergenceBoost',
    value: 50,
    realmAffected: 'all',
    rarity: 'legendary',
    visualTheme: {
      crystalColor: '#ef4444',
      glowColor: '#f87171'
    }
  }
];

export const NexusInventoryPanel: React.FC<NexusInventoryPanelProps> = ({
  isOpen,
  onClose,
  onModuleSelect,
  gameState
}) => {
  const [selectedRealm, setSelectedRealm] = useState<'all' | 'fantasy' | 'scifi'>('all');

  if (!isOpen) return null;

  const filteredModules = selectedRealm === 'all' 
    ? inventoryModules 
    : inventoryModules.filter(m => m.realmAffected === selectedRealm || m.realmAffected === 'all');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400/30 bg-gray-900/20';
      case 'rare': return 'border-blue-400/30 bg-blue-900/20';
      case 'epic': return 'border-purple-400/30 bg-purple-900/20';
      case 'legendary': return 'border-yellow-400/30 bg-yellow-900/20';
      default: return 'border-gray-400/30 bg-gray-900/20';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300';
      case 'rare': return 'text-blue-300';
      case 'epic': return 'text-purple-300';
      case 'legendary': return 'text-yellow-300';
      default: return 'text-gray-300';
    }
  };

  const getRealmColor = (realm: string) => {
    switch (realm) {
      case 'fantasy': return 'text-purple-300';
      case 'scifi': return 'text-cyan-300';
      case 'all': return 'text-yellow-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-slate-800/95 backdrop-blur-xl rounded-xl border border-gray-400/30 overflow-hidden max-w-2xl w-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="text-blue-400" />
            Module Inventory
          </h2>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <X size={16} />
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-black/30 border-b border-gray-400/20">
          <p className="text-sm text-gray-300 text-center">
            Select a module to place on the selected grid tile
          </p>
        </div>

        {/* Realm Filter */}
        <div className="p-4 border-b border-gray-400/20">
          <div className="flex items-center gap-2 justify-center">
            <Filter className="text-gray-400" size={16} />
            <div className="flex gap-2">
              {['all', 'fantasy', 'scifi'].map((realm) => (
                <Button
                  key={realm}
                  size="sm"
                  variant={selectedRealm === realm ? "default" : "outline"}
                  onClick={() => setSelectedRealm(realm as any)}
                  className={`text-xs ${
                    selectedRealm === realm 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-transparent border-gray-400/30 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {realm.charAt(0).toUpperCase() + realm.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredModules.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No modules available</p>
              <p className="text-sm">Complete quests in Fantasy and Sci-Fi realms to unlock modules!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredModules.map((module) => (
                <div
                  key={module.id}
                  className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer hover:border-blue-400/40 ${getRarityColor(module.rarity)}`}
                  onClick={() => onModuleSelect(module.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                      style={{ 
                        backgroundColor: module.visualTheme.crystalColor + '20',
                        borderColor: module.visualTheme.crystalColor
                      }}
                    >
                      <div 
                        className="w-4 h-4 rotate-45"
                        style={{ backgroundColor: module.visualTheme.crystalColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {module.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded capitalize ${getRarityTextColor(module.rarity)} bg-black/40`}>
                          {module.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 mb-2">
                        {module.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded ${getRealmColor(module.realmAffected)} bg-black/40`}>
                          {module.realmAffected === 'all' ? 'All Realms' : 
                           module.realmAffected.charAt(0).toUpperCase() + module.realmAffected.slice(1)}
                        </span>
                        <span className="text-green-300 bg-black/40 px-2 py-1 rounded">
                          +{module.value}{module.effectType.includes('Boost') ? '%' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 text-center">
                    Click to place on selected tile
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
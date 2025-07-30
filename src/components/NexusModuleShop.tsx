import React, { useState } from 'react';
import { X, Crown, Zap, Shield, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NexusModule, getAvailableModules, getModulesByRealm } from '@/data/NexusModules';

interface NexusModuleShopProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: any;
  onPurchase: (module: NexusModule) => void;
}

export const NexusModuleShop: React.FC<NexusModuleShopProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchase
}) => {
  const [selectedRealm, setSelectedRealm] = useState<'all' | 'fantasy' | 'scifi' | 'nexus'>('all');
  
  if (!isOpen) return null;

  const availableModules = getAvailableModules(gameState);
  const filteredModules = selectedRealm === 'all' 
    ? availableModules 
    : getModulesByRealm(selectedRealm).filter(m => availableModules.includes(m));

  const canAfford = (module: NexusModule) => {
    const currency = module.currency;
    const playerAmount = gameState[currency] || 0;
    return playerAmount >= module.cost;
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'mana': return <Crown className="w-4 h-4" />;
      case 'energyCredits': return <Zap className="w-4 h-4" />;
      case 'nexusShards': return <Shield className="w-4 h-4" />;
      default: return <Crown className="w-4 h-4" />;
    }
  };

  const getCurrencyColor = (currency: string) => {
    switch (currency) {
      case 'mana': return 'text-purple-400';
      case 'energyCredits': return 'text-cyan-400';
      case 'nexusShards': return 'text-yellow-400';
      default: return 'text-purple-400';
    }
  };

  const getRealmColor = (realm: string) => {
    switch (realm) {
      case 'fantasy': return 'border-purple-400/30 bg-purple-900/20';
      case 'scifi': return 'border-cyan-400/30 bg-cyan-900/20';
      case 'nexus': return 'border-yellow-400/30 bg-yellow-900/20';
      default: return 'border-gray-400/30 bg-gray-900/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-slate-800/95 backdrop-blur-xl rounded-xl border border-gray-400/30 overflow-hidden max-w-2xl w-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="text-blue-400" />
            Nexus Module Shop
          </h2>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <X size={16} />
          </Button>
        </div>

        {/* Currency Display */}
        <div className="p-4 bg-black/30 border-b border-gray-400/20">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Crown className="text-purple-400" size={16} />
              <span className="text-purple-400 font-bold">
                {gameState?.mana || 0} Mana
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="text-cyan-400" size={16} />
              <span className="text-cyan-400 font-bold">
                {gameState?.energyCredits || 0} Energy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="text-yellow-400" size={16} />
              <span className="text-yellow-400 font-bold">
                {gameState?.nexusShards || 0} Shards
              </span>
            </div>
          </div>
        </div>

        {/* Realm Filter */}
        <div className="p-4 border-b border-gray-400/20">
          <div className="flex items-center gap-2 justify-center">
            <Filter className="text-gray-400" size={16} />
            <div className="flex gap-2">
              {['all', 'fantasy', 'scifi', 'nexus'].map((realm) => (
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

        {/* Modules List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredModules.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No modules available in this category</p>
              <p className="text-sm">Complete more quests to unlock new modules!</p>
            </div>
          ) : (
            filteredModules.map((module) => {
              const affordable = canAfford(module);
              
              return (
                <div
                  key={module.id}
                  className={`rounded-lg p-4 border transition-all duration-200 ${getRealmColor(module.realm)} ${
                    affordable 
                      ? 'hover:border-blue-400/40' 
                      : 'border-gray-600/40 bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: module.visualTheme.crystalColor + '40' }}
                    >
                      <div 
                        className="w-4 h-4 rotate-45"
                        style={{ backgroundColor: module.visualTheme.crystalColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${affordable ? 'text-white' : 'text-gray-500'}`}>
                          {module.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          module.size === 'small' ? 'bg-green-900/50 text-green-300' :
                          module.size === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-red-900/50 text-red-300'
                        }`}>
                          {module.size}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          module.realm === 'fantasy' ? 'bg-purple-900/50 text-purple-300' :
                          module.realm === 'scifi' ? 'bg-cyan-900/50 text-cyan-300' :
                          'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {module.realm}
                        </span>
                      </div>
                      <p className={`text-sm ${affordable ? 'text-white/80' : 'text-gray-500'}`}>
                        {module.description}
                      </p>
                      
                      {/* Effects Display */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {module.effects.manaBonus && (
                          <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                            +{module.effects.manaBonus} Mana/sec
                          </span>
                        )}
                        {module.effects.energyBonus && (
                          <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">
                            +{module.effects.energyBonus} Energy/sec
                          </span>
                        )}
                        {module.effects.globalProductionBonus && (
                          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded">
                            +{(module.effects.globalProductionBonus * 100).toFixed(0)}% Production
                          </span>
                        )}
                        {module.effects.nexusShardGeneration && (
                          <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                            +{module.effects.nexusShardGeneration} Shard/min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold flex items-center gap-1 ${getCurrencyColor(module.currency)}`}>
                        {getCurrencyIcon(module.currency)}
                        {module.cost}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => onPurchase(module)}
                    disabled={!affordable}
                    className={`w-full h-8 text-xs ${
                      affordable
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Purchase & Place
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
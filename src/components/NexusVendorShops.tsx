import React from 'react';
import { X, Crown, Shield, Zap, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorShopProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: any;
  onPurchase: (item: any) => void;
}

// Nexus Merchant Shop - Upgrades and Shards
export const NexusMerchantShop: React.FC<VendorShopProps> = ({ 
  isOpen, 
  onClose, 
  gameState, 
  onPurchase 
}) => {
  const nexusUpgrades = [
    {
      id: 'convergence_boost',
      name: 'Convergence Boost',
      description: 'Increase convergence speed by 25%',
      cost: 50,
      currency: 'nexusShards',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'realm_mastery',
      name: 'Realm Mastery',
      description: 'Unlock advanced realm abilities',
      cost: 100,
      currency: 'nexusShards', 
      icon: <Crown className="w-6 h-6" />
    },
    {
      id: 'energy_amplifier',
      name: 'Energy Amplifier',
      description: 'Double energy generation rate',
      cost: 75,
      currency: 'nexusShards',
      icon: <Plus className="w-6 h-6" />
    }
  ];

  const canAfford = (item: any) => {
    return gameState[item.currency] >= item.cost;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-violet-800/95 backdrop-blur-xl rounded-xl border border-purple-400/30 overflow-hidden max-w-md w-full max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="text-purple-400" />
            Nexus Merchant
          </h2>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <X size={16} />
          </Button>
        </div>

        {/* Currency Display */}
        <div className="p-4 bg-black/30 border-b border-purple-400/20">
          <div className="flex items-center justify-center gap-2">
            <Crown className="text-purple-400" size={20} />
            <span className="text-purple-400 font-bold text-lg">
              {gameState?.nexusShards || 0} Nexus Shards
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {nexusUpgrades.map((item) => {
            const affordable = canAfford(item);
            
            return (
              <div
                key={item.id}
                className={`bg-black/40 rounded-lg p-4 border transition-all duration-200 ${
                  affordable 
                    ? 'border-purple-400/20 hover:border-purple-400/40' 
                    : 'border-gray-600/40 bg-gray-800/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-purple-400">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${affordable ? 'text-white' : 'text-gray-500'}`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm ${affordable ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${affordable ? 'text-purple-400' : 'text-gray-500'}`}>
                      <Crown size={14} className="inline mr-1" />
                      {item.cost}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onPurchase(item)}
                  disabled={!affordable}
                  className={`w-full h-8 text-xs ${
                    affordable
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Purchase
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Supply Keeper Shop - Health and Repair Items
export const SupplyKeeperShop: React.FC<VendorShopProps> = ({ 
  isOpen, 
  onClose, 
  gameState, 
  onPurchase 
}) => {
  const supplies = [
    {
      id: 'health_potion',
      name: 'Health Potion',
      description: 'Restore 50 health points',
      cost: 25,
      currency: 'energyCredits',
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 'repair_kit',
      name: 'Repair Kit',
      description: 'Repair damaged equipment',
      cost: 40,
      currency: 'energyCredits',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'energy_cell',
      name: 'Energy Cell',
      description: 'Restore 100 energy points',
      cost: 30,
      currency: 'energyCredits',
      icon: <Zap className="w-6 h-6" />
    }
  ];

  const canAfford = (item: any) => {
    return gameState[item.currency] >= item.cost;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900/95 to-emerald-800/95 backdrop-blur-xl rounded-xl border border-green-400/30 overflow-hidden max-w-md w-full max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-green-400" />
            Supply Keeper
          </h2>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <X size={16} />
          </Button>
        </div>

        {/* Currency Display */}
        <div className="p-4 bg-black/30 border-b border-green-400/20">
          <div className="flex items-center justify-center gap-2">
            <Zap className="text-cyan-400" size={20} />
            <span className="text-cyan-400 font-bold text-lg">
              {gameState?.energyCredits || 0} Energy Credits
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {supplies.map((item) => {
            const affordable = canAfford(item);
            
            return (
              <div
                key={item.id}
                className={`bg-black/40 rounded-lg p-4 border transition-all duration-200 ${
                  affordable 
                    ? 'border-green-400/20 hover:border-green-400/40' 
                    : 'border-gray-600/40 bg-gray-800/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-green-400">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${affordable ? 'text-white' : 'text-gray-500'}`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm ${affordable ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${affordable ? 'text-cyan-400' : 'text-gray-500'}`}>
                      <Zap size={14} className="inline mr-1" />
                      {item.cost}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onPurchase(item)}
                  disabled={!affordable}
                  className={`w-full h-8 text-xs ${
                    affordable
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Purchase
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Staff Crafter Shop - Magical Staffs and Weapons
export const StaffCrafterShop: React.FC<VendorShopProps> = ({ 
  isOpen, 
  onClose, 
  gameState, 
  onPurchase 
}) => {
  const staffs = [
    {
      id: 'fire_staff',
      name: 'Staff of Flames',
      description: 'Increases fire magic damage by 30%',
      cost: 150,
      currency: 'mana',
      icon: <Zap className="w-6 h-6 text-red-400" />
    },
    {
      id: 'ice_staff',
      name: 'Frost Wand',
      description: 'Slows enemies and deals ice damage',
      cost: 120,
      currency: 'mana',
      icon: <Zap className="w-6 h-6 text-blue-400" />
    },
    {
      id: 'healing_staff',
      name: 'Staff of Restoration',
      description: 'Provides healing abilities',
      cost: 100,
      currency: 'mana',
      icon: <Heart className="w-6 h-6 text-green-400" />
    }
  ];

  const canAfford = (item: any) => {
    return gameState[item.currency] >= item.cost;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900/95 to-indigo-800/95 backdrop-blur-xl rounded-xl border border-blue-400/30 overflow-hidden max-w-md w-full max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-400/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-blue-400" />
            Staff Crafter
          </h2>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <X size={16} />
          </Button>
        </div>

        {/* Currency Display */}
        <div className="p-4 bg-black/30 border-b border-blue-400/20">
          <div className="flex items-center justify-center gap-2">
            <Crown className="text-purple-400" size={20} />
            <span className="text-purple-400 font-bold text-lg">
              {gameState?.mana || 0} Mana
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {staffs.map((item) => {
            const affordable = canAfford(item);
            
            return (
              <div
                key={item.id}
                className={`bg-black/40 rounded-lg p-4 border transition-all duration-200 ${
                  affordable 
                    ? 'border-blue-400/20 hover:border-blue-400/40' 
                    : 'border-gray-600/40 bg-gray-800/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-blue-400">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${affordable ? 'text-white' : 'text-gray-500'}`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm ${affordable ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${affordable ? 'text-purple-400' : 'text-gray-500'}`}>
                      <Crown size={14} className="inline mr-1" />
                      {item.cost}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onPurchase(item)}
                  disabled={!affordable}
                  className={`w-full h-8 text-xs ${
                    affordable
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Purchase
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

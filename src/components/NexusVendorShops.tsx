import React from 'react';
import { X, Crown, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorShopsProps {
  activeVendor: string | null;
  onClose: () => void;
  gameState: any;
}

interface VendorItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'mana' | 'energyCredits' | 'nexusShards';
  category: string;
}

const blacksmithItems: VendorItem[] = [
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: '+15% weapon damage',
    cost: 200,
    currency: 'mana',
    category: 'weapon'
  },
  {
    id: 'steel_armor',
    name: 'Steel Armor',
    description: '+25% defense rating',
    cost: 300,
    currency: 'mana',
    category: 'armor'
  },
  {
    id: 'enchanted_bow',
    name: 'Enchanted Bow',
    description: '+20% ranged damage',
    cost: 250,
    currency: 'mana',
    category: 'weapon'
  }
];

const merchantItems: VendorItem[] = [
  {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    description: '+10 mana per second',
    cost: 150,
    currency: 'energyCredits',
    category: 'passive'
  },
  {
    id: 'energy_core',
    name: 'Energy Core',
    description: '+15 energy per second',
    cost: 200,
    currency: 'mana',
    category: 'passive'
  },
  {
    id: 'nexus_amplifier',
    name: 'Nexus Amplifier',
    description: '+50% all resource generation',
    cost: 50,
    currency: 'nexusShards',
    category: 'amplifier'
  }
];

const mysticItems: VendorItem[] = [
  {
    id: 'portal_scroll',
    name: 'Portal Scroll',
    description: 'Unlock new realm area',
    cost: 75,
    currency: 'nexusShards',
    category: 'unlock'
  },
  {
    id: 'time_crystal',
    name: 'Time Crystal',
    description: '2x offline progression for 24h',
    cost: 100,
    currency: 'nexusShards',
    category: 'boost'
  },
  {
    id: 'wisdom_tome',
    name: 'Wisdom Tome',
    description: '+100% XP gain for 1 hour',
    cost: 30,
    currency: 'nexusShards',
    category: 'boost'
  }
];

const VendorShop: React.FC<{
  title: string;
  items: VendorItem[];
  onPurchase: (item: VendorItem) => void;
  gameState: any;
  primaryColor: string;
}> = ({ title, items, onPurchase, gameState, primaryColor }) => {
  const canAfford = (item: VendorItem) => {
    return (gameState[item.currency] || 0) >= item.cost;
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

  return (
    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
      {items.map((item) => {
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
              <div className="flex-1">
                <h3 className={`font-semibold ${affordable ? 'text-white' : 'text-gray-500'}`}>
                  {item.name}
                </h3>
                <p className={`text-sm ${affordable ? 'text-white/80' : 'text-gray-500'}`}>
                  {item.description}
                </p>
              </div>
              <div className="text-right">
                <div className={`font-bold flex items-center gap-1 ${getCurrencyColor(item.currency)}`}>
                  {getCurrencyIcon(item.currency)}
                  {item.cost}
                </div>
              </div>
            </div>

            <Button
              onClick={() => onPurchase(item)}
              disabled={!affordable}
              className={`w-full h-8 text-xs ${
                affordable
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Purchase
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export const NexusVendorShops: React.FC<VendorShopsProps> = ({
  activeVendor,
  onClose,
  gameState
}) => {
  if (!activeVendor) return null;

  const handlePurchase = (item: VendorItem) => {
    const canAfford = (gameState[item.currency] || 0) >= item.cost;
    if (!canAfford) return;

    // Deduct cost
    switch (item.currency) {
      case 'mana':
        gameState.spendMana(item.cost);
        break;
      case 'energyCredits':
        gameState.spendEnergy(item.cost);
        break;
      case 'nexusShards':
        gameState.spendNexusShards(item.cost);
        break;
    }

    // Add item to inventory or apply effect
    gameState.unlockUpgrade(item.id);
    console.log(`Purchased ${item.name}`);
  };

  const getVendorConfig = () => {
    switch (activeVendor) {
      case 'blacksmith':
        return {
          title: '⚔️ Blacksmith',
          items: blacksmithItems,
          color: 'orange',
          bgGradient: 'from-orange-900/95 to-red-800/95',
          borderColor: 'border-orange-400/30'
        };
      case 'merchant':
        return {
          title: '💎 Crystal Merchant',
          items: merchantItems,
          color: 'purple',
          bgGradient: 'from-purple-900/95 to-violet-800/95',
          borderColor: 'border-purple-400/30'
        };
      case 'mystic':
        return {
          title: '🔮 Mystic Vendor',
          items: mysticItems,
          color: 'green',
          bgGradient: 'from-green-900/95 to-emerald-800/95',
          borderColor: 'border-green-400/30'
        };
      default:
        return {
          title: 'Vendor',
          items: [],
          color: 'blue',
          bgGradient: 'from-blue-900/95 to-indigo-800/95',
          borderColor: 'border-blue-400/30'
        };
    }
  };

  const config = getVendorConfig();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl rounded-xl border ${config.borderColor} overflow-hidden max-w-md w-full max-h-[80vh]`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${config.borderColor}`}>
          <h2 className="text-xl font-bold text-white">
            {config.title}
          </h2>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <X size={16} />
          </Button>
        </div>

        {/* Currency Display */}
        <div className={`p-4 bg-black/30 border-b ${config.borderColor}`}>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Crown className="text-purple-400" size={16} />
              <span className="text-purple-400 font-bold">
                {Math.floor(gameState?.mana || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="text-cyan-400" size={16} />
              <span className="text-cyan-400 font-bold">
                {Math.floor(gameState?.energyCredits || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="text-yellow-400" size={16} />
              <span className="text-yellow-400 font-bold">
                {gameState?.nexusShards || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <VendorShop
          title={config.title}
          items={config.items}
          onPurchase={handlePurchase}
          gameState={gameState}
          primaryColor={config.color}
        />
      </div>
    </div>
  );
};
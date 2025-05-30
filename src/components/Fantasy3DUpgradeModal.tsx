
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Coins, Zap } from 'lucide-react';

interface Fantasy3DUpgradeModalProps {
  upgradeName: string;
  onClose: () => void;
  onPurchase?: () => void;
}

const upgradeDetails = {
  'Mystic Fountain': { description: 'Ancient stones channel mystical energy from flowing waters, providing a steady stream of magical power.', cost: 50, effect: '+10 Mana per second', icon: '⛲' },
  'Crystal Grove': { description: 'Enchanted crystals that amplify magical resonance throughout your realm.', cost: 250, effect: '+50 Mana per second', icon: '💎' },
  'Arcane Sanctum': { description: 'Sacred chamber where ancient magic is studied and preserved by mystical scholars.', cost: 1000, effect: '+150 Mana per second', icon: '🏛️' },
  'Celestial Spire': { description: 'Towering monument that pierces the veil between realms, channeling cosmic energy.', cost: 4000, effect: '+400 Mana per second', icon: '🗼' },
  'Nexus Gateway': { description: 'Portal to infinite dimensions of pure magical energy, unlocking untold power.', cost: 15000, effect: '+1000 Mana per second', icon: '🌌' },
  'Dragon\'s Heart': { description: 'The beating heart of an ancient dragon, source of primal fire and raw power.', cost: 50000, effect: '+2500 Mana per second', icon: '🐉' },
  'Void Obelisk': { description: 'Monolith that channels the power of the cosmic void, transcending reality itself.', cost: 150000, effect: '+6000 Mana per second', icon: '⚫' },
  'Temporal Altar': { description: 'Sacred altar that manipulates the flow of time to accelerate magical processes.', cost: 400000, effect: '+12000 Mana per second', icon: '⏰' },
  'Phoenix Roost': { description: 'Eternal flame that never dies, generating endless magical energy through rebirth.', cost: 1000000, effect: '+25000 Mana per second', icon: '🔥' },
  'Ethereal Nexus': { description: 'Connection point between multiple planes of existence, channeling interdimensional power.', cost: 2500000, effect: '+50000 Mana per second', icon: '✨' },
  'Starfall Chamber': { description: 'Observatory that captures the power of falling stars and converts it to pure magic.', cost: 6000000, effect: '+100000 Mana per second', icon: '🌠' },
  'Infinity Well': { description: 'Bottomless well that taps into the infinite reservoir of magical energy.', cost: 15000000, effect: '+200000 Mana per second', icon: '🕳️' },
  'Cosmic Forge': { description: 'Ancient forge that shapes reality itself, creating magical energy from the void.', cost: 35000000, effect: '+400000 Mana per second', icon: '⚒️' },
  'Dimensional Anchor': { description: 'Stabilizes reality and draws power from dimensional fractures.', cost: 80000000, effect: '+800000 Mana per second', icon: '⚓' },
  'Reality Prism': { description: 'Crystalline structure that refracts reality into infinite magical possibilities.', cost: 200000000, effect: '+1600000 Mana per second', icon: '🔮' },
  'Astral Crown': { description: 'Crown of the astral realm, granting dominion over celestial magical forces.', cost: 500000000, effect: '+3200000 Mana per second', icon: '👑' },
  'Omni Core': { description: 'Core of omnipotent energy that transcends all known magical limitations.', cost: 1200000000, effect: '+6400000 Mana per second', icon: '💫' },
  'Genesis Matrix': { description: 'Matrix that contains the blueprint of creation itself, generating infinite power.', cost: 3000000000, effect: '+12800000 Mana per second', icon: '🌀' },
  'Eternal Beacon': { description: 'Beacon of eternal light that guides lost souls and generates endless energy.', cost: 7500000000, effect: '+25600000 Mana per second', icon: '🗼' },
  'Infinite Spiral': { description: 'Spiral pattern that contains infinite recursive magical energy loops.', cost: 18000000000, effect: '+51200000 Mana per second', icon: '🌀' },
  'Transcendent Gate': { description: 'Gateway beyond all understanding, connecting to the source of all magic.', cost: 45000000000, effect: '+102400000 Mana per second', icon: '🚪' },
  'Primordial Engine': { description: 'Engine that harnesses the primordial forces that created the universe.', cost: 110000000000, effect: '+204800000 Mana per second', icon: '⚙️' },
  'Universal Codex': { description: 'Contains all knowledge of magic across every possible reality.', cost: 270000000000, effect: '+409600000 Mana per second', icon: '📜' },
  'Apex Throne': { description: 'Throne of absolute magical supremacy, commanding all forces of creation.', cost: 650000000000, effect: '+819200000 Mana per second', icon: '🪑' },
  'Omega Singularity': { description: 'The final singularity that represents the end and beginning of all magic.', cost: 1600000000000, effect: '+1638400000 Mana per second', icon: '🌑' }
};

export const Fantasy3DUpgradeModal: React.FC<Fantasy3DUpgradeModalProps> = ({
  upgradeName,
  onClose,
  onPurchase
}) => {
  const upgrade = upgradeDetails[upgradeName as keyof typeof upgradeDetails];

  if (!upgrade) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-sm max-h-[70vh] backdrop-blur-lg border-2 overflow-hidden flex flex-col bg-gradient-to-br from-purple-900/95 to-violet-800/90 border-purple-400/50"
      style={{
        boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-purple-300/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{upgrade.icon}</div>
          <div>
            <h2 className="text-lg font-bold text-white">{upgradeName}</h2>
            <p className="text-sm text-purple-200">Mystical Enhancement</p>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 p-1 h-8 w-8 rounded-full flex-shrink-0"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <p className="text-sm text-white/90 leading-relaxed">{upgrade.description}</p>
        
        {/* Stats Display */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-purple-400/20">
            <div className="flex items-center gap-2">
              <Zap className="text-green-400" size={16} />
              <span className="text-white/80 text-sm">Power Bonus</span>
            </div>
            <span className="font-bold text-green-400 text-sm">
              {upgrade.effect}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-purple-400/20">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-400" size={16} />
              <span className="text-white/80 text-sm">Investment Cost</span>
            </div>
            <span className="font-bold text-yellow-400 text-sm">
              {formatNumber(upgrade.cost)} Mana
            </span>
          </div>
        </div>

        {/* Mystical preview area */}
        <div className="bg-gradient-to-br from-purple-900/50 to-violet-800/50 rounded-lg p-4 text-center border border-purple-400/30">
          <p className="text-purple-200/80 text-xs mb-2">Mystical Preview</p>
          <div className="text-5xl mb-2">{upgrade.icon}</div>
          <div className="w-full h-1 bg-purple-800/50 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Purchase Button */}
      <div className="p-4 border-t border-purple-300/30 flex-shrink-0">
        <Button
          onClick={onPurchase}
          className="w-full transition-all duration-300 py-3 font-bold text-sm bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-purple-500/25"
        >
          <Coins className="mr-2" size={16} />
          Unlock for {formatNumber(upgrade.cost)} Mana
        </Button>
      </div>
    </Card>
  );
};

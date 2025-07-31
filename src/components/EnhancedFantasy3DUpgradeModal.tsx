import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnhancedFantasy3DUpgradeModalProps {
  upgrade: {
    id: number;
    name: string;
    cost: number;
    manaPerSecond: number;
    description: string;
    tier: number;
    modelType: 'podium' | 'obelisk';
  };
  currentMana: number;
  isPurchased: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export const EnhancedFantasy3DUpgradeModal: React.FC<EnhancedFantasy3DUpgradeModalProps> = ({
  upgrade,
  currentMana,
  isPurchased,
  onClose,
  onPurchase
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const canAfford = currentMana >= upgrade.cost;
  
  // Get tier colors and effects
  const getTierInfo = (tier: number) => {
    const tierNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    const tierColors = ['text-slate-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-orange-400'];
    const tierGradients = [
      'from-slate-500/20 to-slate-600/20',
      'from-green-500/20 to-green-600/20', 
      'from-blue-500/20 to-blue-600/20',
      'from-purple-500/20 to-purple-600/20',
      'from-orange-500/20 to-orange-600/20'
    ];
    
    return {
      name: tierNames[tier] || 'Legendary',
      color: tierColors[tier] || 'text-orange-400',
      gradient: tierGradients[tier] || 'from-orange-500/20 to-orange-600/20'
    };
  };

  const tierInfo = getTierInfo(upgrade.tier);
  
  // Calculate section (every 5 upgrades)
  const sectionNumber = Math.floor(upgrade.id / 5) + 1;
  const upgradeNumberInSection = (upgrade.id % 5) + 1;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-md mx-auto bg-gradient-to-br ${tierInfo.gradient} border-2 border-white/20 shadow-2xl`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${tierInfo.color} border-current`}>
                {tierInfo.name}
              </Badge>
              {upgrade.modelType === 'obelisk' && (
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  Nexus
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {upgrade.name}
          </CardTitle>
          <CardDescription className="text-slate-300">
            Section {sectionNumber} • Upgrade {upgradeNumberInSection}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Description
            </h4>
            <p className="text-white leading-relaxed">
              {upgrade.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="text-sm text-slate-400 mb-1">Mana Generation</div>
              <div className="text-xl font-bold text-blue-400">
                +{formatNumber(upgrade.manaPerSecond)}/sec
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="text-sm text-slate-400 mb-1">Cost</div>
              <div className={`text-xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                {formatNumber(upgrade.cost)} Mana
              </div>
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-black/30 rounded-lg p-3 border border-white/10">
            <div className="text-sm text-slate-400 mb-1">Efficiency</div>
            <div className="text-lg font-semibold text-yellow-400">
              {(upgrade.manaPerSecond / upgrade.cost * 100).toFixed(2)}% per Mana
            </div>
          </div>

          {/* Current Mana */}
          <div className="bg-black/30 rounded-lg p-3 border border-white/10">
            <div className="text-sm text-slate-400 mb-1">Your Mana</div>
            <div className="text-lg font-semibold text-white">
              {formatNumber(currentMana)}
            </div>
          </div>

          {/* Purchase Button */}
          <div className="pt-2">
            {isPurchased ? (
              <div className="text-center py-4">
                <Badge variant="outline" className="text-green-400 border-green-400 text-lg px-4 py-2">
                  ✓ Purchased
                </Badge>
              </div>
            ) : (
              <Button
                onClick={onPurchase}
                disabled={!canAfford}
                className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
                  canAfford
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canAfford ? (
                  <>Purchase for {formatNumber(upgrade.cost)} Mana</>
                ) : (
                  <>Need {formatNumber(upgrade.cost - currentMana)} more Mana</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
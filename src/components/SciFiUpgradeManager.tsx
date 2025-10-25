import React, { useState } from 'react';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { SCIFI_UPGRADES, SciFiUpgrade } from '@/data/SciFiUpgradeSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface SciFiUpgradeManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SciFiUpgradeManager: React.FC<SciFiUpgradeManagerProps> = ({
  isOpen,
  onClose
}) => {
  const {
    unlockedUpgrades,
    nexusInventory,
    meteorsDestroyed,
    currentLayer,
    timeInCurrentLayer,
    cannonProgress,
    defeatedBosses,
    placeRelicTest
  } = useScifiLayerStore();

  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'cannon' | 'tech' | 'relic'>('cannon');

  if (!isOpen) return null;

  const getUpgradesByType = (type: SciFiUpgrade['type']) => {
    return Object.values(SCIFI_UPGRADES).filter(upgrade => upgrade.type === type);
  };

  const isUpgradeUnlocked = (upgradeId: string) => {
    return unlockedUpgrades.includes(upgradeId);
  };

  const getProgressToUnlock = (upgrade: SciFiUpgrade) => {
    const { unlockCondition } = upgrade;
    
    switch (unlockCondition.type) {
      case 'meteors':
        return {
          current: meteorsDestroyed,
          required: unlockCondition.requirement as number,
          label: 'Meteors Destroyed'
        };
      case 'layer':
        return {
          current: currentLayer,
          required: unlockCondition.requirement as number,
          label: 'Current Layer'
        };
      case 'time':
        return {
          current: Math.floor(timeInCurrentLayer / 1000),
          required: Math.floor((unlockCondition.requirement as number) / 1000),
          label: 'Time in Layer (seconds)'
        };
      case 'cannon': {
        const cannons = Object.values(cannonProgress);
        if (unlockCondition.requirement === 'maxUpgrade') {
          const maxTier = Math.max(0, ...cannons.map(c => c.tier));
          return {
            current: maxTier,
            required: 5,
            label: 'Max Cannon Tier'
          };
        }
        if (unlockCondition.requirement === 'maxAbilities') {
          const maxAbilities = Math.max(0, ...cannons.map(c => c.abilities.length));
          return {
            current: maxAbilities,
            required: 5,
            label: 'Max Abilities'
          };
        }
        return {
          current: cannons.length,
          required: unlockCondition.requirement as number,
          label: 'Cannons Upgraded'
        };
      }
      case 'boss':
        return {
          current: defeatedBosses.includes(unlockCondition.requirement as string) ? 1 : 0,
          required: 1,
          label: 'Boss Defeated'
        };
      default:
        return { current: 0, required: 1, label: 'Unknown' };
    }
  };

  const handleRelicTest = (relicId: string) => {
    placeRelicTest(relicId);
    toast({
      title: "Relic Tested",
      description: `${SCIFI_UPGRADES[relicId].name} has been added to your Nexus inventory!`,
    });
  };

  const renderUpgradeCard = (upgrade: SciFiUpgrade) => {
    const isUnlocked = isUpgradeUnlocked(upgrade.id);
    const progress = getProgressToUnlock(upgrade);
    const progressPercent = Math.min(100, (progress.current / progress.required) * 100);

    return (
      <Card 
        key={upgrade.id} 
        className={`transition-all duration-200 ${
          isUnlocked 
            ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30' 
            : 'bg-slate-900/50 border-slate-700/50'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{upgrade.name}</CardTitle>
            <div className="flex gap-2">
              {upgrade.tier && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  Tier {upgrade.tier}
                </Badge>
              )}
              <Badge 
                variant={isUnlocked ? "default" : "secondary"}
                className={isUnlocked ? "bg-green-600" : ""}
              >
                {isUnlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">{upgrade.description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{progress.label}</span>
              <span className="text-slate-300">
                {progress.current} / {progress.required}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Effect preview */}
          <div className="text-xs text-cyan-400">
            Effect: {upgrade.effect.type} 
            {upgrade.effect.value && ` +${(upgrade.effect.value * 100).toFixed(0)}%`}
            {upgrade.effect.global && " (Global)"}
          </div>

          {/* Unlock condition */}
          <div className="text-xs text-orange-400">
            {upgrade.unlockCondition.description}
          </div>

          {/* Relic test button */}
          {upgrade.type === 'relic' && !isUnlocked && (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full text-xs"
              onClick={() => handleRelicTest(upgrade.id)}
            >
              🧪 Test Relic
            </Button>
          )}

          {/* Nexus status for relics */}
          {upgrade.type === 'relic' && isUnlocked && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400">Available in Nexus</span>
              {nexusInventory.includes(upgrade.id) && (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✨ In Inventory
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-cyan-400">Sci-Fi Upgrade System</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          
          {/* Progress overview */}
          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-orange-400 font-bold">{meteorsDestroyed}</div>
              <div className="text-slate-400">Meteors Destroyed</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-bold">{currentLayer}</div>
              <div className="text-slate-400">Current Layer</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">{unlockedUpgrades.length}</div>
              <div className="text-slate-400">Upgrades Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold">{nexusInventory.length}</div>
              <div className="text-slate-400">Nexus Relics</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cannon">Cannon Upgrades</TabsTrigger>
              <TabsTrigger value="tech">Tech Upgrades</TabsTrigger>
              <TabsTrigger value="relic">Relic Modules</TabsTrigger>
            </TabsList>

            <TabsContent value="cannon" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {getUpgradesByType('cannon').map(renderUpgradeCard)}
              </div>
            </TabsContent>

            <TabsContent value="tech" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {getUpgradesByType('tech').map(renderUpgradeCard)}
              </div>
            </TabsContent>

            <TabsContent value="relic" className="mt-6">
              <div className="space-y-4">
                <div className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded">
                  <strong className="text-cyan-400">Relic Modules:</strong> These powerful ancient technologies can be unlocked in the Sci-Fi world and placed in your Nexus for global bonuses. Each relic provides unique effects that enhance all realms.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                  {getUpgradesByType('relic').map(renderUpgradeCard)}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
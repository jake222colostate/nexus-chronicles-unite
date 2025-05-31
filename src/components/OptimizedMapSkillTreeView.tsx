
import React, { useState, useCallback } from 'react';
import { Optimized3DWorldManager } from './Optimized3DWorldManager';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { TapResourceEffect } from './TapResourceEffect';
import { UpgradeFloatingTooltip } from './UpgradeFloatingTooltip';
import { BuildingUpgradeModal } from './BuildingUpgradeModal';
import { HybridUpgradeModal } from './HybridUpgradeModal';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';

interface OptimizedMapSkillTreeViewProps {
  realm: 'fantasy' | 'scifi';
  buildings: { [key: string]: number };
  manaPerSecond: number;
  energyPerSecond: number;
  onBuyBuilding: (buildingId: string) => void;
  buildingData: any[];
  currency: number;
  isTransitioning?: boolean;
  gameState: any;
  onPurchaseUpgrade: (upgradeId: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
  onJourneyUpdate: (distance: number) => void;
}

export const OptimizedMapSkillTreeView: React.FC<OptimizedMapSkillTreeViewProps> = ({
  realm,
  gameState,
  onPurchaseUpgrade,
  showTapEffect = false,
  onTapEffectComplete,
  onPlayerPositionUpdate,
  onJourneyUpdate
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [selected3DUpgrade, setSelected3DUpgrade] = useState<string | null>(null);

  const handleUpgradeClick = useCallback((upgradeId: string) => {
    setSelectedUpgrade(upgradeId);
  }, []);

  const handle3DUpgradeClick = useCallback((upgradeName: string) => {
    setSelected3DUpgrade(upgradeName);
  }, []);

  const handleUpgradePurchase = useCallback(() => {
    if (selectedUpgrade) {
      onPurchaseUpgrade(selectedUpgrade);
      setSelectedUpgrade(null);
    }
  }, [selectedUpgrade, onPurchaseUpgrade]);

  const handle3DUpgradePurchase = useCallback(() => {
    console.log('Purchasing 3D upgrade:', selected3DUpgrade);
    setSelected3DUpgrade(null);
  }, [selected3DUpgrade]);

  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedUpgrade(null);
      setSelected3DUpgrade(null);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Optimized3DWorldManager
        realm={realm}
        onPlayerPositionUpdate={onPlayerPositionUpdate}
        onJourneyUpdate={onJourneyUpdate}
      />

      {showTapEffect && onTapEffectComplete && (
        <TapResourceEffect
          realm={realm}
          onComplete={onTapEffectComplete}
        />
      )}

      {selectedUpgrade && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-[90%] max-h-[70vh]">
            <HybridUpgradeModal
              upgrade={enhancedHybridUpgrades.find(u => u.id === selectedUpgrade)!}
              gameState={gameState}
              onPurchase={handleUpgradePurchase}
              onClose={() => setSelectedUpgrade(null)}
            />
          </div>
        </div>
      )}

      {selected3DUpgrade && (
        <Fantasy3DUpgradeModal
          upgradeName={selected3DUpgrade}
          onClose={() => setSelected3DUpgrade(null)}
          onPurchase={handle3DUpgradePurchase}
        />
      )}
    </div>
  );
};

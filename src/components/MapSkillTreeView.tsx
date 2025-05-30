
import React, { useState, useCallback } from 'react';
import { Scene3D } from './Scene3D';
import { TapResourceEffect } from './TapResourceEffect';
import { UpgradeFloatingTooltip } from './UpgradeFloatingTooltip';
import { BuildingUpgradeModal } from './BuildingUpgradeModal';
import { HybridUpgradeModal } from './HybridUpgradeModal';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';

interface MapSkillTreeViewProps {
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
}

export const MapSkillTreeView: React.FC<MapSkillTreeViewProps> = ({
  realm,
  buildings,
  manaPerSecond,
  energyPerSecond,
  onBuyBuilding,
  buildingData,
  currency,
  isTransitioning = false,
  gameState,
  onPurchaseUpgrade,
  showTapEffect = false,
  onTapEffectComplete
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<{
    building: any;
    count: number;
  } | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [upgradeTooltips, setUpgradeTooltips] = useState<Array<{
    id: number;
    buildingName: string;
    level: number;
    position: { x: number; y: number };
  }>>([]);

  const handleUpgradeClick = useCallback((upgradeId: string) => {
    setSelectedUpgrade(upgradeId);
  }, []);

  const handleUpgradePurchase = useCallback(() => {
    if (selectedUpgrade) {
      onPurchaseUpgrade(selectedUpgrade);
      setSelectedUpgrade(null);
    }
  }, [selectedUpgrade, onPurchaseUpgrade]);

  const removeUpgradeTooltip = useCallback((id: number) => {
    setUpgradeTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
  }, []);

  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBuilding(null);
      setSelectedUpgrade(null);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 3D Scene */}
      <Scene3D
        realm={realm}
        gameState={gameState}
        onUpgradeClick={handleUpgradeClick}
        isTransitioning={isTransitioning}
        showTapEffect={showTapEffect}
        onTapEffectComplete={onTapEffectComplete}
      />

      {/* 2D Tap Resource Effect Overlay */}
      {showTapEffect && onTapEffectComplete && (
        <TapResourceEffect
          realm={realm}
          onComplete={onTapEffectComplete}
        />
      )}

      {/* Upgrade Tooltips */}
      {upgradeTooltips.map((tooltip) => (
        <UpgradeFloatingTooltip
          key={tooltip.id}
          buildingName={tooltip.buildingName}
          level={tooltip.level}
          realm={realm}
          position={tooltip.position}
          onComplete={() => removeUpgradeTooltip(tooltip.id)}
        />
      ))}

      {/* Building Upgrade Modal */}
      {selectedBuilding && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-[90%] max-h-[70vh]">
            <BuildingUpgradeModal
              building={selectedBuilding.building}
              count={selectedBuilding.count}
              realm={realm}
              currency={currency}
              onBuy={() => {}}
              onClose={() => setSelectedBuilding(null)}
            />
          </div>
        </div>
      )}

      {/* Hybrid Upgrade Modal */}
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
    </div>
  );
};


import React, { useState, useCallback } from 'react';
import { Scene3D } from './Scene3D';
import { Fantasy3DUpgradeWorld } from './Fantasy3DUpgradeWorld';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
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
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
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
  onTapEffectComplete,
  onPlayerPositionUpdate,
  onEnemyCountChange,
  onEnemyKilled
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<{
    building: any;
    count: number;
  } | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [selected3DUpgrade, setSelected3DUpgrade] = useState<string | null>(null);
  const [upgradeTooltips, setUpgradeTooltips] = useState<Array<{
    id: number;
    buildingName: string;
    level: number;
    position: { x: number; y: number };
  }>>([]);

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
    // Handle 3D upgrade purchase logic here
    setSelected3DUpgrade(null);
  }, [selected3DUpgrade]);

  const removeUpgradeTooltip = useCallback((id: number) => {
    setUpgradeTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
  }, []);

  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBuilding(null);
      setSelectedUpgrade(null);
      setSelected3DUpgrade(null);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 3D Scene - Use Fantasy 3D World for fantasy realm, Scene3D for sci-fi */}
      {realm === 'fantasy' ? (
        <Fantasy3DUpgradeWorld
          onUpgradeClick={handle3DUpgradeClick}
          showTapEffect={showTapEffect}
          onTapEffectComplete={onTapEffectComplete}
          gameState={gameState}
          realm={realm}
          onPlayerPositionUpdate={onPlayerPositionUpdate}
          onEnemyCountChange={onEnemyCountChange}
          onEnemyKilled={onEnemyKilled}
        />
      ) : (
        <Scene3D
          realm={realm}
          gameState={gameState}
          onUpgradeClick={handleUpgradeClick}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={onTapEffectComplete}
        />
      )}

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

      {/* 3D Fantasy Upgrade Modal */}
      {selected3DUpgrade && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-sm">
            <Fantasy3DUpgradeModal
              upgradeName={selected3DUpgrade}
              onClose={() => setSelected3DUpgrade(null)}
              onPurchase={handle3DUpgradePurchase}
              upgradeData={{
                cost: 100,
                manaPerSecond: 10,
                unlocked: false
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

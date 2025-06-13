
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  onMeteorDestroyed?: () => void;
  weaponDamage: number;
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
  onEnemyKilled,
  onMeteorDestroyed,
  weaponDamage
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

  // Stable references to prevent infinite re-renders
  const stableGameState = useMemo(() => gameState, [
    gameState?.mana,
    gameState?.energyCredits,
    gameState?.nexusShards
  ]);

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

  const removeUpgradeTooltip = useCallback((id: number) => {
    setUpgradeTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
  }, []);

  const handleCloseSelectedBuilding = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedBuilding(null);
  }, []);

  const handleCloseSelectedUpgrade = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedUpgrade(null);
  }, []);

  const handleClose3DUpgrade = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelected3DUpgrade(null);
  }, []);

  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBuilding(null);
      setSelectedUpgrade(null);
      setSelected3DUpgrade(null);
    }
  }, []);

  // Find selected upgrade data
  const selectedUpgradeData = useMemo(() => {
    if (!selectedUpgrade) return null;
    return enhancedHybridUpgrades.find(upgrade => upgrade.id === selectedUpgrade);
  }, [selectedUpgrade]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 3D Scene - Use Fantasy 3D World for fantasy realm, Scene3D for sci-fi */}
      {realm === 'fantasy' ? (
        <Fantasy3DUpgradeWorld
          key="fantasy-world"
          onUpgradeClick={handle3DUpgradeClick}
          showTapEffect={showTapEffect}
          onTapEffectComplete={onTapEffectComplete}
          gameState={stableGameState}
          realm={realm}
          onPlayerPositionUpdate={onPlayerPositionUpdate}
          onEnemyCountChange={onEnemyCountChange}
          onEnemyKilled={onEnemyKilled}
          weaponDamage={weaponDamage}
        />
      ) : (
        <Scene3D
          key="scifi-world"
          realm={realm}
          gameState={stableGameState}
          onUpgradeClick={handleUpgradeClick}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={onTapEffectComplete}
          onMeteorDestroyed={onMeteorDestroyed}
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
              onClose={handleCloseSelectedBuilding}
            />
          </div>
        </div>
      )}

      {/* Hybrid Upgrade Modal */}
      {selectedUpgrade && selectedUpgradeData && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-[90%] max-h-[70vh]">
            <HybridUpgradeModal
              upgrade={selectedUpgradeData}
              gameState={stableGameState}
              onPurchase={handleUpgradePurchase}
              onClose={handleCloseSelectedUpgrade}
            />
          </div>
        </div>
      )}

      {/* 3D Upgrade Modal */}
      {selected3DUpgrade && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalBackdropClick}
        >
          <div className="w-full max-w-sm">
            <Fantasy3DUpgradeModal
              upgradeName={selected3DUpgrade}
              onClose={handleClose3DUpgrade}
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

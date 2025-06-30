
import React, { useState, useCallback } from 'react';
import { SceneRenderer } from './SceneRenderer';
import { UpgradeModalManager } from './UpgradeModalManager';
import { TapResourceEffect } from './TapResourceEffect';
import { UpgradeFloatingTooltip } from './UpgradeFloatingTooltip';

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
  upgradesPurchased?: number;
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
  weaponDamage,
  upgradesPurchased = 0
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<{
    building: any;
    count: number;
  } | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [selected3DUpgrade, setSelected3DUpgrade] = useState<string | null>(null);
  const [selectedScifiUpgrade, setSelectedScifiUpgrade] = useState<string | null>(null);
  const [selectedFantasyUpgrade, setSelectedFantasyUpgrade] = useState<string | null>(null);
  const [showNexusShardShop, setShowNexusShardShop] = useState(false);
  const [upgradeTooltips, setUpgradeTooltips] = useState<Array<{
    id: number;
    buildingName: string;
    level: number;
    position: { x: number; y: number };
  }>>([]);

  // Handlers
  const handleUpgradeClick = useCallback((upgradeId: string) => {
    setSelectedUpgrade(upgradeId);
  }, []);

  const handle3DUpgradeClick = useCallback((upgradeName: string) => {
    setSelected3DUpgrade(upgradeName);
  }, []);

  const handleScifiUpgradePurchase = useCallback((upgradeId: string) => {
    // Handle sci-fi upgrade purchase and check for nexus shard earning
    onPurchaseUpgrade(upgradeId);
    setSelectedScifiUpgrade(null);
  }, [onPurchaseUpgrade]);

  const handleFantasyUpgradePurchase = useCallback((upgradeId: string) => {
    // Handle fantasy upgrade purchase and check for nexus shard earning
    onPurchaseUpgrade(upgradeId);
    setSelectedFantasyUpgrade(null);
  }, [onPurchaseUpgrade]);

  const handleNexusShardUpgradePurchase = useCallback((upgradeId: string) => {
    console.log('Purchasing nexus shard upgrade:', upgradeId);
  }, []);

  const removeUpgradeTooltip = useCallback((id: number) => {
    setUpgradeTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 3D Scene */}
      <SceneRenderer
        realm={realm}
        gameState={gameState}
        showTapEffect={showTapEffect}
        isTransitioning={isTransitioning}
        onTapEffectComplete={onTapEffectComplete}
        onUpgradeClick={handleUpgradeClick}
        on3DUpgradeClick={handle3DUpgradeClick}
        onPlayerPositionUpdate={onPlayerPositionUpdate}
        onEnemyCountChange={onEnemyCountChange}
        onEnemyKilled={onEnemyKilled}
        onMeteorDestroyed={onMeteorDestroyed}
        weaponDamage={weaponDamage}
        upgradesPurchased={upgradesPurchased}
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

      {/* All Modals */}
      <UpgradeModalManager
        selectedBuilding={selectedBuilding}
        selectedUpgrade={selectedUpgrade}
        selected3DUpgrade={selected3DUpgrade}
        selectedScifiUpgrade={selectedScifiUpgrade}
        selectedFantasyUpgrade={selectedFantasyUpgrade}
        showNexusShardShop={showNexusShardShop}
        realm={realm}
        currency={currency}
        gameState={gameState}
        onCloseBuilding={() => setSelectedBuilding(null)}
        onCloseUpgrade={() => setSelectedUpgrade(null)}
        onClose3DUpgrade={() => setSelected3DUpgrade(null)}
        onCloseScifiUpgrade={() => setSelectedScifiUpgrade(null)}
        onCloseFantasyUpgrade={() => setSelectedFantasyUpgrade(null)}
        onCloseNexusShardShop={() => setShowNexusShardShop(false)}
        onPurchaseUpgrade={() => {
          if (selectedUpgrade) {
            onPurchaseUpgrade(selectedUpgrade);
            setSelectedUpgrade(null);
          }
        }}
        onPurchase3DUpgrade={() => {
          setSelected3DUpgrade(null);
        }}
        onPurchaseScifiUpgrade={handleScifiUpgradePurchase}
        onPurchaseFantasyUpgrade={handleFantasyUpgradePurchase}
        onPurchaseNexusShardUpgrade={handleNexusShardUpgradePurchase}
      />
    </div>
  );
};

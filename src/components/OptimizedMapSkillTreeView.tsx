
import React, { useState, useCallback } from 'react';
import { Optimized3DWorldManager } from './Optimized3DWorldManager';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { TapResourceEffect } from './TapResourceEffect';
import { BuildingUpgradeModal } from './BuildingUpgradeModal';
import { HybridUpgradeModal } from './HybridUpgradeModal';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { Enemy3DSystem, Enemy3D } from './3DEnemySystem';
import { AutoAttackTower } from './AutoAttackTower';

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
  const [enemies, setEnemies] = useState<Enemy3D[]>([]);

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

  const handleEnemyReachPlayer = useCallback((enemy: Enemy3D) => {
    // Remove enemy that reached player
    setEnemies(prev => prev.filter(e => e.id !== enemy.id));
    console.log('Enemy reached player:', enemy.id);
  }, []);

  const handleEnemyDestroyed = useCallback((enemy: Enemy3D) => {
    // Remove destroyed enemy
    setEnemies(prev => prev.filter(e => e.id !== enemy.id));
    console.log('Enemy destroyed:', enemy.id);
  }, []);

  const handleProjectileHit = useCallback((targetId: string, damage: number) => {
    setEnemies(prev => 
      prev.map(enemy => {
        if (enemy.id === targetId) {
          const newHealth = enemy.health - damage;
          if (newHealth <= 0) {
            handleEnemyDestroyed(enemy);
            return null;
          }
          return { ...enemy, health: newHealth, isBeingHit: true };
        }
        return enemy;
      }).filter(Boolean) as Enemy3D[]
    );
  }, [handleEnemyDestroyed]);

  const handleMuzzleFlash = useCallback(() => {
    console.log('Muzzle flash!');
  }, []);

  const combatStats = {
    damage: 1 + (gameState.combatUpgrades?.manaBlaster || 0) * 2,
    fireRate: Math.max(500, 1000 - ((gameState.combatUpgrades?.fireRate || 0) * 80)),
    range: 20 + (gameState.combatUpgrades?.autoAim || 0) * 3
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Optimized3DWorldManager
        realm={realm}
        onPlayerPositionUpdate={onPlayerPositionUpdate}
        onJourneyUpdate={onJourneyUpdate}
      >
        {/* 3D Enemy System */}
        <Enemy3DSystem
          realm={realm}
          onEnemyReachPlayer={handleEnemyReachPlayer}
          onEnemyDestroyed={handleEnemyDestroyed}
          spawnRate={Math.max(1500, 3000 - ((gameState.waveNumber || 1) * 150))}
          maxEnemies={Math.min(8, 3 + Math.floor((gameState.waveNumber || 1) / 2))}
          journeyDistance={gameState.journeyDistance || 0}
          upgradeCount={gameState.purchasedUpgrades?.length || 0}
        />

        {/* Auto-Attack Tower */}
        <AutoAttackTower
          enemies={enemies}
          damage={combatStats.damage}
          fireRate={combatStats.fireRate}
          range={combatStats.range}
          onProjectileHit={handleProjectileHit}
          onMuzzleFlash={handleMuzzleFlash}
        />
      </Optimized3DWorldManager>

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

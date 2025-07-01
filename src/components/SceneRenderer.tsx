
import React from 'react';
import { Scene3D } from './Scene3D';
import { Fantasy3DUpgradeWorld } from './Fantasy3DUpgradeWorld';
import { useMapEditorStore } from '../stores/useMapEditorStore';

interface SceneRendererProps {
  realm: 'fantasy' | 'scifi';
  gameState: any;
  showTapEffect: boolean;
  isTransitioning: boolean;
  onTapEffectComplete?: () => void;
  onUpgradeClick: (upgradeId: string) => void;
  on3DUpgradeClick: (upgradeName: string) => void;
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  onMeteorDestroyed?: () => void;
  weaponDamage: number;
  upgradesPurchased: number;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  realm,
  gameState,
  showTapEffect,
  isTransitioning,
  onTapEffectComplete,
  onUpgradeClick,
  on3DUpgradeClick,
  onPlayerPositionUpdate,
  onEnemyCountChange,
  onEnemyKilled,
  onMeteorDestroyed,
  weaponDamage,
  upgradesPurchased
}) => {
  const { isEditorActive } = useMapEditorStore();

  return (
    <>
      {isEditorActive ? (
        <Scene3D
          key="editor-scene"
          realm={realm}
          gameState={gameState}
          onUpgradeClick={onUpgradeClick}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={onTapEffectComplete}
          onMeteorDestroyed={onMeteorDestroyed}
        />
      ) : realm === 'fantasy' ? (
        <Fantasy3DUpgradeWorld
          key="fantasy-world"
          onUpgradeClick={on3DUpgradeClick}
          showTapEffect={showTapEffect}
          onTapEffectComplete={onTapEffectComplete}
          gameState={gameState}
          realm={realm}
          onPlayerPositionUpdate={onPlayerPositionUpdate}
          onEnemyCountChange={onEnemyCountChange}
          onEnemyKilled={onEnemyKilled}
          weaponDamage={weaponDamage}
          upgradesPurchased={upgradesPurchased}
        />
      ) : (
        <Scene3D
          key="scifi-world"
          realm={realm}
          gameState={gameState}
          onUpgradeClick={onUpgradeClick}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={onTapEffectComplete}
          onMeteorDestroyed={onMeteorDestroyed}
        />
      )}
    </>
  );
};

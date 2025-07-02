
import React from 'react';
import { Scene3D } from './Scene3D';
import { Fantasy3DUpgradeWorld } from './Fantasy3DUpgradeWorld';
import { useMapEditorStore } from '../stores/useMapEditorStore';

interface SceneRendererProps {
  realm: 'fantasy' | 'scifi' | 'nexus';
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
          realm={realm === 'nexus' ? 'fantasy' : realm}
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
      ) : realm === 'scifi' ? (
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
      ) : (
        <div key="nexus-world" className="w-full h-full">
          {/* Import and use NexusWorld component */}
          <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🌌</div>
                <h2 className="text-2xl font-bold text-indigo-300 mb-2">Nexus Realm</h2>
                <p className="text-indigo-400">A space between worlds</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

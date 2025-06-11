
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFantasy3DUpgradeWorld } from './hooks/useFantasy3DUpgradeWorld';
import { Fantasy3DScene } from './Fantasy3DScene';
import { Fantasy3DUpgradePedestals } from './Fantasy3DUpgradePedestals';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { Fantasy3DInsufficientManaMessage } from './Fantasy3DInsufficientManaMessage';

interface Fantasy3DUpgradeWorldProps {
  onUpgradeClick: (upgradeName: string) => void;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  gameState?: any;
  realm?: 'fantasy' | 'scifi';
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
}

export const Fantasy3DUpgradeWorld: React.FC<Fantasy3DUpgradeWorldProps> = ({
  onUpgradeClick,
  showTapEffect,
  onTapEffectComplete,
  gameState,
  realm = 'fantasy',
  onPlayerPositionUpdate,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage
}) => {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const {
    cameraPosition,
    selectedUpgrade,
    showInsufficientMana,
    maxUnlockedUpgrade,
    currentManaRef,
    upgrades,
    CHUNK_SIZE,
    RENDER_DISTANCE,
    UPGRADE_SPACING,
    handlePositionChange,
    handleUpgradeClick,
    handleUpgradePurchase,
    handleTierProgression,
    setSelectedUpgrade
  } = useFantasy3DUpgradeWorld({
    gameState,
    onPlayerPositionUpdate
  });

  // Force Canvas to initialize properly on mount
  useEffect(() => {
    console.log('Fantasy3DUpgradeWorld: Initializing for realm:', realm);
    if (realm === 'fantasy') {
      // Small delay to ensure proper initialization
      const timer = setTimeout(() => {
        setIsCanvasReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [realm]);

  // Only render if realm is fantasy and canvas is ready
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      {isCanvasReady && (
        <Canvas
          key="fantasy-canvas" // Force re-mount if needed
          dpr={[1, 1]}
          camera={{ 
            position: [0, 5, 12], 
            fov: 50,
            near: 0.1,
            far: 1200
          }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          onCreated={(state) => {
            console.log('Fantasy3DUpgradeWorld: Canvas created successfully');
            // Ensure camera is properly set up
            state.camera.updateProjectionMatrix();
          }}
        >
          <Fantasy3DScene
            cameraPosition={cameraPosition}
            onPositionChange={handlePositionChange}
            realm={realm}
            maxUnlockedUpgrade={maxUnlockedUpgrade}
            upgradeSpacing={UPGRADE_SPACING}
            onTierProgression={handleTierProgression}
            chunkSize={CHUNK_SIZE}
            renderDistance={RENDER_DISTANCE}
            onEnemyCountChange={onEnemyCountChange}
            onEnemyKilled={onEnemyKilled}
            weaponDamage={weaponDamage}
          />

          <Fantasy3DUpgradePedestals
            upgrades={upgrades}
            cameraPosition={cameraPosition}
            currentManaRef={currentManaRef}
            onUpgradeClick={handleUpgradeClick}
          />
        </Canvas>
      )}

      <Fantasy3DInsufficientManaMessage show={showInsufficientMana} />

      {selectedUpgrade && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedUpgrade(null);
            }
          }}
        >
          <div className="w-full max-w-sm">
            <Fantasy3DUpgradeModal
              upgradeName={selectedUpgrade.name}
              onClose={() => setSelectedUpgrade(null)}
              onPurchase={() => handleUpgradePurchase(selectedUpgrade)}
              upgradeData={{
                cost: selectedUpgrade.cost,
                manaPerSecond: selectedUpgrade.manaPerSecond,
                unlocked: selectedUpgrade.unlocked
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

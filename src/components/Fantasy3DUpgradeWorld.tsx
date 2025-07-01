
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFantasy3DUpgradeWorld } from './hooks/useFantasy3DUpgradeWorld';
import { Fantasy3DScene } from './Fantasy3DScene';
import { Fantasy3DUpgradePedestals } from './Fantasy3DUpgradePedestals';
import { Fantasy3DUpgradeModal } from './Fantasy3DUpgradeModal';
import { Fantasy3DInsufficientManaMessage } from './Fantasy3DInsufficientManaMessage';
import { UpgradeActivationOverlay } from './UpgradeActivationOverlay';
import { TreeAssetManager } from '../environment/TreeAssetManager';

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
  upgradesPurchased?: number;
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
  weaponDamage,
  upgradesPurchased = 0
}) => {
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [previousUpgradeCount, setPreviousUpgradeCount] = useState(0);

  const {
    cameraPosition,
    selectedUpgrade,
    showInsufficientMana,
    maxUnlockedUpgrade,
    currentManaRef,
    upgrades,
    purchasedUpgrades,
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

  // Track upgrade count changes for notification
  useEffect(() => {
    if (maxUnlockedUpgrade !== previousUpgradeCount) {
      setPreviousUpgradeCount(maxUnlockedUpgrade);
    }
  }, [maxUnlockedUpgrade, previousUpgradeCount]);

  // Preload environment assets once on mount
  useEffect(() => {
    let cancelled = false;
    TreeAssetManager.preloadAllModels().then(() => {
      if (!cancelled) setAssetsLoaded(true);
    }).catch((error) => {
      console.error('Fantasy3DUpgradeWorld: Error loading assets:', error);
      if (!cancelled) setAssetsLoaded(true); // Continue anyway
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize canvas when realm changes to fantasy
  useEffect(() => {
    if (realm === 'fantasy' && !isCanvasReady) {
      const timer = setTimeout(() => {
        setIsCanvasReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (realm !== 'fantasy') {
      setIsCanvasReady(false);
    }
  }, [realm, isCanvasReady]);

  // Only render if realm is fantasy and canvas is ready
  if (realm !== 'fantasy') {
    return null;
  }

  try {
    return (
      <div className="absolute inset-0 w-full h-full">
        {(!assetsLoaded || !isCanvasReady) && (
          <div className="absolute inset-0 flex items-center justify-center text-white bg-black">
            Loading Fantasy World...
          </div>
        )}
        {isCanvasReady && assetsLoaded && (
          <Canvas
            key="fantasy-canvas"
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
              upgradesPurchased={upgradesPurchased}
            />

            <Fantasy3DUpgradePedestals
              upgrades={upgrades}
              cameraPosition={cameraPosition}
              currentManaRef={currentManaRef}
              purchasedUpgrades={purchasedUpgrades}
              onUpgradeClick={handleUpgradeClick}
            />
          </Canvas>
        )}

        {/* MOVED: Upgrade activation overlay outside Canvas */}
        <UpgradeActivationOverlay 
          upgrades={maxUnlockedUpgrade}
          previousUpgrades={previousUpgradeCount}
        />

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
                  purchased: purchasedUpgrades.has(selectedUpgrade.id)
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Fantasy3DUpgradeWorld: Error during render:', error);
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-red-900/20">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Fantasy World Error</h2>
          <p className="text-sm opacity-75">Check console for details</p>
        </div>
      </div>
    );
  }
};
